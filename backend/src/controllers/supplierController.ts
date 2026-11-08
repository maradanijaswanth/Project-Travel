import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SupplierController {
  public static async list(req: Request, res: Response) {
    try {
      const { category, maturity, season, search } = req.query;
      const where: any = {};

      if (category) {
        where.category = String(category);
      }
      if (maturity) {
        where.maturity_level = String(maturity);
      }
      if (season && season !== 'All') {
        where.season = { in: [String(season), 'All'] };
      }
      if (search) {
        const query = String(search).toLowerCase();
        where.OR = [
          { name: { contains: query } },
          { location: { contains: query } },
          { description: { contains: query } },
        ];
      }

      const suppliers = await prisma.supplier.findMany({
        where,
        include: {
          capabilities: true,
          modules: true,
        },
        orderBy: { name: 'asc' },
      });

      return res.json({ success: true, data: suppliers });
    } catch (err: any) {
      console.error('[SupplierController.list] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch suppliers' });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await prisma.supplier.findUnique({
        where: { supplier_id: id },
        include: {
          capabilities: true,
          modules: {
            orderBy: { created_at: 'desc' },
          },
        },
      });

      if (!supplier) {
        return res.status(404).json({ success: false, error: 'Supplier not found' });
      }

      return res.json({ success: true, data: supplier });
    } catch (err: any) {
      console.error('[SupplierController.getById] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch supplier' });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const body = req.body;
      if (!body.name || !body.category || !body.location) {
        return res.status(400).json({ success: false, error: 'Name, category, and location are required' });
      }

      const supplier = await prisma.supplier.create({
        data: {
          name: body.name,
          category: body.category,
          season: body.season || 'All',
          capacity: parseInt(String(body.capacity || 10), 10),
          price_range: body.price_range || 'Standard',
          location: body.location,
          latitude: body.latitude ? parseFloat(String(body.latitude)) : null,
          longitude: body.longitude ? parseFloat(String(body.longitude)) : null,
          languages_supported: JSON.stringify(body.languages_supported || ['English', 'Latvian']),
          status: body.status || 'ACTIVE',
          maturity_level: body.maturity_level || 'M1',
          contact_name: body.contact_name || null,
          contact_email: body.contact_email || null,
          contact_phone: body.contact_phone || null,
          website_url: body.website_url || null,
          description: body.description || null,
        },
      });

      return res.status(201).json({ success: true, data: supplier });
    } catch (err: any) {
      console.error('[SupplierController.create] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to create supplier' });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const body = req.body;

      const data: any = {};
      if (body.name !== undefined) data.name = body.name;
      if (body.category !== undefined) data.category = body.category;
      if (body.season !== undefined) data.season = body.season;
      if (body.capacity !== undefined) data.capacity = parseInt(String(body.capacity), 10);
      if (body.price_range !== undefined) data.price_range = body.price_range;
      if (body.location !== undefined) data.location = body.location;
      if (body.status !== undefined) data.status = body.status;
      if (body.maturity_level !== undefined) data.maturity_level = body.maturity_level;
      if (body.contact_name !== undefined) data.contact_name = body.contact_name;
      if (body.contact_email !== undefined) data.contact_email = body.contact_email;
      if (body.contact_phone !== undefined) data.contact_phone = body.contact_phone;
      if (body.website_url !== undefined) data.website_url = body.website_url;
      if (body.description !== undefined) data.description = body.description;
      if (body.languages_supported !== undefined) {
        data.languages_supported = Array.isArray(body.languages_supported) 
          ? JSON.stringify(body.languages_supported) 
          : body.languages_supported;
      }

      const updated = await prisma.supplier.update({
        where: { supplier_id: id },
        data,
      });

      return res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('[SupplierController.update] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to update supplier' });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.supplier.delete({ where: { supplier_id: id } });
      return res.json({ success: true, message: 'Supplier deleted successfully' });
    } catch (err: any) {
      console.error('[SupplierController.delete] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to delete supplier' });
    }
  }

  public static async addCapability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const body = req.body;

      const capability = await prisma.capability.create({
        data: {
          supplier_id: id,
          name: body.name,
          category: body.category || 'General',
          participation_mode: body.participation_mode || 'Interact',
          is_winter_capable: Boolean(body.is_winter_capable),
          is_private_group_feasible: body.is_private_group_feasible !== undefined ? Boolean(body.is_private_group_feasible) : true,
          min_capacity: parseInt(String(body.min_capacity || 1), 10),
          max_capacity: parseInt(String(body.max_capacity || 30), 10),
          equipment_notes: body.equipment_notes || null,
          operating_boundaries: body.operating_boundaries || null,
        },
      });

      return res.status(201).json({ success: true, data: capability });
    } catch (err: any) {
      console.error('[SupplierController.addCapability] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to add capability' });
    }
  }

  public static async addModule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const body = req.body;

      const moduleItem = await prisma.module.create({
        data: {
          supplier_id: id,
          capability_id: body.capability_id || null,
          title: body.title,
          description: body.description,
          category: body.category,
          route_code: body.route_code || 'RIGA_GATEWAY',
          seasonal_lens: body.seasonal_lens || 'Expansion',
          seasons_supported: JSON.stringify(body.seasons_supported || ['Spring', 'Summer', 'Autumn', 'Winter']),
          target_segments: JSON.stringify(body.target_segments || ['Cultural Explorers']),
          duration_hours: parseFloat(String(body.duration_hours || 2.0)),
          indicative_price_eur: parseFloat(String(body.indicative_price_eur || 50.0)),
          price_tier: body.price_tier || 'Standard',
          location_name: body.location_name || 'Latvia',
          maturity_level: body.maturity_level || 'M2', // default M2 until reviewed
          requires_human_quote: body.requires_human_quote !== undefined ? Boolean(body.requires_human_quote) : true,
          provenance: body.provenance || 'CO_DESIGN_PROPOSAL',
          evidence_notes: body.evidence_notes || null,
          safety_fallback: body.safety_fallback || null,
        },
      });

      return res.status(201).json({ success: true, data: moduleItem });
    } catch (err: any) {
      console.error('[SupplierController.addModule] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to add module' });
    }
  }

  public static async updateModule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const body = req.body;

      const data: any = {};
      if (body.title !== undefined) data.title = body.title;
      if (body.description !== undefined) data.description = body.description;
      if (body.category !== undefined) data.category = body.category;
      if (body.route_code !== undefined) data.route_code = body.route_code;
      if (body.seasonal_lens !== undefined) data.seasonal_lens = body.seasonal_lens;
      if (body.maturity_level !== undefined) data.maturity_level = body.maturity_level;
      if (body.duration_hours !== undefined) data.duration_hours = parseFloat(String(body.duration_hours));
      if (body.indicative_price_eur !== undefined) data.indicative_price_eur = parseFloat(String(body.indicative_price_eur));
      if (body.price_tier !== undefined) data.price_tier = body.price_tier;
      if (body.location_name !== undefined) data.location_name = body.location_name;
      if (body.provenance !== undefined) data.provenance = body.provenance;
      if (body.evidence_notes !== undefined) data.evidence_notes = body.evidence_notes;
      if (body.safety_fallback !== undefined) data.safety_fallback = body.safety_fallback;
      if (body.seasons_supported !== undefined) {
        data.seasons_supported = Array.isArray(body.seasons_supported) ? JSON.stringify(body.seasons_supported) : body.seasons_supported;
      }
      if (body.target_segments !== undefined) {
        data.target_segments = Array.isArray(body.target_segments) ? JSON.stringify(body.target_segments) : body.target_segments;
      }

      const updated = await prisma.module.update({
        where: { module_id: id },
        data,
      });

      return res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error('[SupplierController.updateModule] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to update module' });
    }
  }
}
