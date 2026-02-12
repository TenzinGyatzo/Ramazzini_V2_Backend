import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProveedoresSaludService } from '../modules/proveedores-salud/proveedores-salud.service';

/**
 * NOM-024 Compliance Utility
 *
 * Provides utilities to check if NOM-024 compliance is required
 * based on ProveedorSalud.regimenRegulatorio === 'SIRES_NOM024'
 * Falls back to pais === 'MX' for backward compatibility
 *
 * This utility should be injected into services where conditional
 * NOM-024 validation is needed.
 */
@Injectable()
export class NOM024ComplianceUtil {
  private providerCache = new Map<
    string,
    { pais: string; regimenRegulatorio?: string; timestamp: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  constructor(
    @Inject(forwardRef(() => ProveedoresSaludService))
    private readonly proveedoresSaludService: ProveedoresSaludService,
  ) {}

  /**
   * Obtiene el régimen regulatorio de un proveedor
   * @param proveedorSaludId - ObjectId del ProveedorSalud
   * @returns Promise<'SIRES_NOM024' | 'SIN_REGIMEN' | null>
   */
  async getRegimenRegulatorio(
    proveedorSaludId: string | Types.ObjectId,
  ): Promise<'SIRES_NOM024' | 'SIN_REGIMEN' | null> {
    const idString = proveedorSaludId.toString();

    // Check cache first
    const cached = this.providerCache.get(idString);
    if (
      cached &&
      cached.regimenRegulatorio &&
      Date.now() - cached.timestamp < this.CACHE_TTL
    ) {
      // Normalizar valores antiguos del cache
      const regimen = cached.regimenRegulatorio as
        | 'SIRES_NOM024'
        | 'SIN_REGIMEN'
        | 'NO_SUJETO_SIRES';
      return regimen === 'NO_SUJETO_SIRES' ? 'SIN_REGIMEN' : regimen;
    }

    try {
      // Validate ObjectId format
      if (!Types.ObjectId.isValid(idString)) {
        return null;
      }

      const proveedor = await this.proveedoresSaludService.findOne(idString);

      if (!proveedor) {
        return null;
      }

      // Si tiene régimen explícito, retornarlo (normalizando valores antiguos)
      if (proveedor.regimenRegulatorio) {
        let regimen = proveedor.regimenRegulatorio as
          | 'SIRES_NOM024'
          | 'SIN_REGIMEN'
          | 'NO_SUJETO_SIRES';

        // Normalizar valores antiguos
        if (regimen === 'NO_SUJETO_SIRES') {
          regimen = 'SIN_REGIMEN';
        }

        // Update cache
        this.providerCache.set(idString, {
          pais: proveedor.pais || '',
          regimenRegulatorio: regimen,
          timestamp: Date.now(),
        });

        return regimen;
      }

      // Si no tiene régimen pero es MX, asumir SIN_REGIMEN (compatibilidad)
      if (proveedor.pais === 'MX') {
        const regimen = 'SIN_REGIMEN';

        // Update cache
        this.providerCache.set(idString, {
          pais: proveedor.pais,
          regimenRegulatorio: regimen,
          timestamp: Date.now(),
        });

        return regimen;
      }

      return null; // No aplica para países distintos de MX
    } catch (error) {
      // Log error but return null to gracefully handle failures
      console.error(
        `Error retrieving provider regimen for ${idString}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Check if a provider requires NOM-024 compliance
   * Ahora basado en régimen explícito, no solo en país
   *
   * @param proveedorSaludId - ObjectId of the ProveedorSalud
   * @returns Promise<boolean> - true if compliance is required (SIRES_NOM024)
   */
  async requiresNOM024Compliance(
    proveedorSaludId: string | Types.ObjectId,
  ): Promise<boolean> {
    const regimen = await this.getRegimenRegulatorio(proveedorSaludId);
    return regimen === 'SIRES_NOM024';
  }

  /**
   * Get the country code of a provider
   *
   * @param proveedorSaludId - ObjectId of the ProveedorSalud
   * @returns Promise<string> - Country code (e.g., 'MX', 'GT', 'PA')
   */
  async getProveedorPais(
    proveedorSaludId: string | Types.ObjectId,
  ): Promise<string | null> {
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
        regimenRegulatorio: proveedor.regimenRegulatorio,
        timestamp: Date.now(),
      });

      return pais;
    } catch (error) {
      // Log error but return null to gracefully handle failures
      console.error(
        `Error retrieving provider country for ${idString}:`,
        error,
      );
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
