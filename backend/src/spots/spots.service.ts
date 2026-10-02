import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spot } from './spot.entity.js';
import { SpotResponseDto } from './spot-response.dto.js';

export function toSpotResponse(spot: Spot): SpotResponseDto {
  // GeoJSON は [経度, 緯度] の順
  const [lng, lat] = spot.location.coordinates;
  return {
    id: spot.id,
    name: spot.name,
    category: spot.category,
    address: spot.address,
    lat,
    lng,
  };
}

@Injectable()
export class SpotsService {
  constructor(
    @InjectRepository(Spot) private readonly spots: Repository<Spot>,
  ) {}

  async findAll(): Promise<SpotResponseDto[]> {
    const spots = await this.spots.find({ order: { id: 'ASC' } });
    return spots.map(toSpotResponse);
  }
}
