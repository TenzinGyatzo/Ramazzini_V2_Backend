import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProveedoresSaludService } from '../modules/proveedores-salud/proveedores-salud.service';

/**
 * NOM-024 Compliance Utility
 * 
 * Provides utilities to check if NOM-024 compliance is required
 * based on ProveedorSalud.pais === 'MX'
 * 
 * This utility should be injected into services where conditional
 * NOM-024 validation is needed.
 */
@Injectable()
export class NOM024ComplianceUtil {
  private providerCache = new Map<string, { pais: string; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  constructor(
    @Inject(forwardRef(() => ProveedoresSaludService))
    private readonly proveedoresSaludService: ProveedoresSaludService,
  ) {}

  /**
   * Check if a provider requires NOM-024 compliance
   * NOM-024 compliance applies ONLY when proveedorSalud.pais === 'MX'
   * 
   * @param proveedorSaludId - ObjectId of the ProveedorSalud
   * @returns Promise<boolean> - true if compliance is required (MX provider)
   */
  async requiresNOM024Compliance(proveedorSaludId: string | Types.ObjectId): Promise<boolean> {
    const pais = await this.getProveedorPais(proveedorSaludId);
    return pais === 'MX';
  }

  /**
   * Get the country code of a provider
   * 
   * @param proveedorSaludId - ObjectId of the ProveedorSalud
   * @returns Promise<string> - Country code (e.g., 'MX', 'GT', 'PA')
   */
  async getProveedorPais(proveedorSaludId: string | Types.ObjectId): Promise<string | null> {
    const idString = proveedorSaludId.toString();
    
    // Check cache first
    const cached = this.providerCache.get(idString);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.pais;
    }

    try {
      // Validate ObjectId format
      if (!Types.ObjectId.isValid(idString)) {
        return null;
      }

      const proveedor = await this.proveedoresSaludService.findOne(idString);
      
      if (!proveedor || !proveedor.pais) {
        return null;
      }

      const pais = proveedor.pais;
      
      // Update cache
      this.providerCache.set(idString, {
        pais,
        timestamp: Date.now(),
      });

      return pais;
    } catch (error) {
      // Log error but return null to gracefully handle failures
      console.error(`Error retrieving provider country for ${idString}:`, error);
      return null;
    }
  }

  /**
   * Clear cache for a specific provider (useful after updates)
   */
  clearProviderCache(proveedorSaludId: string | Types.ObjectId): void {
    const idString = proveedorSaludId.toString();
    this.providerCache.delete(idString);
  }

  /**
   * Clear all provider cache
   */
  clearAllCache(): void {
    this.providerCache.clear();
  }
}

