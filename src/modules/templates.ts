import { HttpClient } from '../client';
import { Template, CreateTemplateOptions, UpdateTemplateOptions } from '../types';

export class Templates {
  constructor(private client: HttpClient) {}

  /**
   * Create a new notification template.
   */
  async create(options: CreateTemplateOptions): Promise<Template> {
    return this.client.post<Template>('/templates', options);
  }

  /**
   * List all templates.
   */
  async list(): Promise<Template[]> {
    return this.client.get<Template[]>('/templates');
  }

  /**
   * Get a template by ID.
   */
  async get(id: string): Promise<Template> {
    return this.client.get<Template>(`/templates/${id}`);
  }

  /**
   * Update a template.
   */
  async update(id: string, options: UpdateTemplateOptions): Promise<Template> {
    return this.client.put<Template>(`/templates/${id}`, options);
  }

  /**
   * Delete a template.
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/templates/${id}`);
  }

  /**
   * Render a template with variables.
   */
  async render(
    id: string,
    variables?: Record<string, string>,
    locale?: string,
  ): Promise<{ title: string; body: string; data?: Record<string, any> }> {
    return this.client.post<{ title: string; body: string; data?: Record<string, any> }>(
      `/templates/${id}/render`,
      { variables, locale },
    );
  }

  /**
   * Duplicate a template.
   */
  async duplicate(id: string): Promise<Template> {
    return this.client.post<Template>(`/templates/${id}/duplicate`);
  }
}
