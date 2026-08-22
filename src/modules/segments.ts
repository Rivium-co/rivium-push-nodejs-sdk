import { HttpClient } from '../client';
import {
  Segment,
  CreateSegmentOptions,
  UpdateSegmentOptions,
  Device,
  SegmentPreviewOptions,
  SegmentPreviewResult,
} from '../types';

export class Segments {
  constructor(private client: HttpClient) {}

  /**
   * Create a new segment.
   */
  async create(options: CreateSegmentOptions): Promise<Segment> {
    return this.client.post<Segment>('/segments', options);
  }

  /**
   * List all segments.
   */
  async list(): Promise<Segment[]> {
    return this.client.get<Segment[]>('/segments');
  }

  /**
   * Get a segment by ID.
   */
  async get(id: string): Promise<Segment> {
    return this.client.get<Segment>(`/segments/${id}`);
  }

  /**
   * Update a segment.
   */
  async update(id: string, options: UpdateSegmentOptions): Promise<Segment> {
    return this.client.put<Segment>(`/segments/${id}`, options);
  }

  /**
   * Delete a segment.
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/segments/${id}`);
  }

  /**
   * Get devices in a segment.
   */
  async getDevices(id: string): Promise<Device[]> {
    return this.client.get<Device[]>(`/segments/${id}/devices`);
  }

  /**
   * Recalculate segment membership.
   */
  async recalculate(id: string): Promise<{ deviceCount: number }> {
    return this.client.post<{ deviceCount: number }>(`/segments/${id}/recalculate`);
  }

  /**
   * Recalculate all segments.
   */
  async recalculateAll(): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>('/segments/recalculate-all');
  }

  /**
   * Preview a set of filters without saving. Returns the total match count
   * plus a small sample of matching devices — useful for validating filters
   * before creating a segment.
   *
   * @example
   * ```ts
   * const { count, preview } = await rivium.segments.preview({
   *   filters: [
   *     { field: 'platform', operator: 'equals', value: 'ios' },
   *     { field: 'metadata.plan', operator: 'equals', value: 'premium' },
   *   ],
   * });
   * console.log(`${count} devices match`);
   * ```
   */
  async preview(options: SegmentPreviewOptions = {}): Promise<SegmentPreviewResult> {
    const { limit, ...body } = options;
    const path = limit ? `/segments/preview?limit=${limit}` : '/segments/preview';
    return this.client.post<SegmentPreviewResult>(path, body);
  }
}
