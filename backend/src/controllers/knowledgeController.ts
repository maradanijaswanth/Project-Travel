import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SEVEN_ROUTES, SEASON_DESCRIPTIONS, SEASON_LENSES } from '../config/constants.js';

const prisma = new PrismaClient();

export class KnowledgeController {
  public static async getRoutes(req: Request, res: Response) {
    return res.json({
      success: true,
      data: Object.values(SEVEN_ROUTES),
    });
  }

  public static async getSeasons(req: Request, res: Response) {
    return res.json({
      success: true,
      data: {
        lenses: SEASON_LENSES,
        descriptions: SEASON_DESCRIPTIONS,
      },
    });
  }

  public static async getStats(req: Request, res: Response) {
    try {
      const [totalSuppliers, totalModules, totalJourneys, totalCustomers] = await Promise.all([
        prisma.supplier.count(),
        prisma.module.count(),
        prisma.journey.count(),
        prisma.customer.count(),
      ]);

      const maturityCounts = await prisma.module.groupBy({
        by: ['maturity_level'],
        _count: { module_id: true },
      });

      const journeyStatusCounts = await prisma.journey.groupBy({
        by: ['status'],
        _count: { journey_id: true },
      });

      const routeCounts = await prisma.module.groupBy({
        by: ['route_code'],
        _count: { module_id: true },
      });

      return res.json({
        success: true,
        data: {
          totals: {
            suppliers: totalSuppliers,
            modules: totalModules,
            journeys: totalJourneys,
            customers: totalCustomers,
          },
          maturityDistribution: maturityCounts.reduce((acc, curr) => {
            acc[curr.maturity_level] = curr._count.module_id;
            return acc;
          }, {} as Record<string, number>),
          journeyStatusDistribution: journeyStatusCounts.reduce((acc, curr) => {
            acc[curr.status] = curr._count.journey_id;
            return acc;
          }, {} as Record<string, number>),
          routeDistribution: routeCounts.reduce((acc, curr) => {
            acc[curr.route_code] = curr._count.module_id;
            return acc;
          }, {} as Record<string, number>),
        },
      });
    } catch (err: any) {
      console.error('[KnowledgeController.getStats] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to aggregate statistics' });
    }
  }
}
