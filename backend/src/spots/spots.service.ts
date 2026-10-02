import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindSpotsQueryDto } from './find-spots-query.dto.js';
import { Spot } from './spot.entity.js';
import { SpotResponseDto } from './spot-response.dto.js';

export function toSpotResponse(spot: Spot, distance?: number): SpotResponseDto {
  // GeoJSON は [経度, 緯度] の順
  const [lng, lat] = spot.location.coordinates;
  return {
    id: spot.id,
    name: spot.name,
    category: spot.category,
    address: spot.address,
    lat,
    lng,
    ...(distance !== undefined && { distance }),
  };
}

@Injectable()
export class SpotsService {
  constructor(
    @InjectRepository(Spot) private readonly spots: Repository<Spot>,
  ) {}

  async findAll(query: FindSpotsQueryDto = {}): Promise<SpotResponseDto[]> {
    const { lat, lng, radius } = query;
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      return this.findNear(lat, lng, radius);
    }

    const spots = await this.spots.find({ order: { id: 'ASC' } });
    return spots.map((spot) => toSpotResponse(spot));
  }

  /** 中心から radius メートル以内のスポットを、近い順に返す */
  private async findNear(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<SpotResponseDto[]> {
    const center = 'ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography';

    // ST_DWithin は空間インデックス（GiST）が効く。距離は geography なのでメートル
    const { entities, raw } = await this.spots
      .createQueryBuilder('spot')
      .addSelect(`ST_Distance(spot.location, ${center})`, 'distance')
      .where(`ST_DWithin(spot.location, ${center}, :radius)`)
      .setParameters({ lat, lng, radius })
      .orderBy('distance', 'ASC')
      .addOrderBy('spot.id', 'ASC')
      .getRawAndEntities<{ distance: string }>();

    return entities.map((spot, i) =>
      toSpotResponse(spot, Number(raw[i].distance)),
    );
  }
}
