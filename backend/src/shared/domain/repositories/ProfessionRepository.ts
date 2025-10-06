export interface ProfessionRepository {
  /**
   * Get all valid profession names from database
   */
  findAll(): Promise<string[]>;

  /**
   * Check if a profession name exists in database
   */
  exists(professionName: string): Promise<boolean>;

  /**
   * Find professions by their names
   * Returns only the professions that exist in database
   */
  findByNames(professionNames: string[]): Promise<string[]>;
}
