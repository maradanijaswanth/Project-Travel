import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CustomerController {
  public static async list(req: Request, res: Response) {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          journeys: {
            select: {
              journey_id: true,
              title: true,
              status: true,
              primary_route: true,
              estimated_budget_eur: true,
              created_at: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return res.json({ success: true, data: customers });
    } catch (err: any) {
      console.error('[CustomerController.list] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch customer requests' });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await prisma.customer.findUnique({
        where: { customer_id: id },
        include: {
          journeys: {
            include: {
              itineraries: true,
              approvals: true,
            },
          },
        },
      });

      if (!customer) {
        return res.status(404).json({ success: false, error: 'Customer not found' });
      }

      return res.json({ success: true, data: customer });
    } catch (err: any) {
      console.error('[CustomerController.getById] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch customer details' });
    }
  }
}
