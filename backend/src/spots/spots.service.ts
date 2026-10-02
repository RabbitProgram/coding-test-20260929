import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spot } from './spot.entity.js';

export interface SpotResponse {
  id: string;
  name: string;
  category: string;
  address: string | null;
  lat: number;
  lng: number;
}

export function toSpotResponse(spot: Spot): SpotResponse {
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

  async findAll(): Promise<SpotResponse[]> {
    const spots = await this.spots.find({ order: { id: 'ASC' } });
    return spots.map(toSpotResponse);
  }
}
