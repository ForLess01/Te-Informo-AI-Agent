/**
 * Servicio de gestión de intereses del usuario
 */
export class UserInterestsService {
  private userInterests: Map<string, string[]> = new Map();

  /**
   * Obtiene los intereses de un usuario
   */
  getUserInterests(userId: string = 'default'): string[] {
    return this.userInterests.get(userId) || [];
  }

  /**
   * Agrega un interés al usuario
   */
  addInterest(interest: string, userId: string = 'default'): void {
    const interests = this.getUserInterests(userId);
    
    // Normalizar y evitar duplicados
    const normalizedInterest = interest.trim().toLowerCase();
    if (!interests.some(i => i.toLowerCase() === normalizedInterest)) {
      interests.push(interest.trim());
      this.userInterests.set(userId, interests);
      console.log(`✅ Interés agregado: "${interest}" para usuario ${userId}`);
    }
  }

  /**
   * Elimina un interés del usuario
   */
  removeInterest(interest: string, userId: string = 'default'): void {
    const interests = this.getUserInterests(userId);
    const filtered = interests.filter(i => 
      i.toLowerCase() !== interest.toLowerCase()
    );
    this.userInterests.set(userId, filtered);
    console.log(`🗑️ Interés eliminado: "${interest}" para usuario ${userId}`);
  }

  /**
   * Establece todos los intereses del usuario
   */
  setInterests(interests: string[], userId: string = 'default'): void {
    this.userInterests.set(userId, interests);
    console.log(`📝 Intereses actualizados para usuario ${userId}: ${interests.join(', ')}`);
  }

  /**
   * Limpia todos los intereses del usuario
   */
  clearInterests(userId: string = 'default'): void {
    this.userInterests.delete(userId);
    console.log(`🧹 Intereses limpiados para usuario ${userId}`);
  }

  /**
   * Obtiene todos los usuarios con intereses
   */
  getAllUsers(): string[] {
    return Array.from(this.userInterests.keys());
  }
}

export default new UserInterestsService();
