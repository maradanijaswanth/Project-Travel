import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { JourneyComposerService } from '../services/journeyComposerService.js';
import { CustomerIntentInput } from '../types/index.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const prisma = new PrismaClient();
const composerService = new JourneyComposerService(prisma);

export class JourneyController {
  public static async compose(req: Request, res: Response) {
    try {
      const body = req.body;
      if (!body.fullName || !body.email || !body.tripPurpose || !body.travellerType || !body.durationDays || !body.season) {
        return res.status(400).json({ 
          success: false, 
          error: 'Required fields: fullName, email, tripPurpose, travellerType, durationDays, season' 
        });
      }

      const intent: CustomerIntentInput = {
        fullName: String(body.fullName).trim(),
        email: String(body.email).trim(),
        phone: body.phone ? String(body.phone).trim() : undefined,
        tripPurpose: String(body.tripPurpose),
        travellerType: String(body.travellerType),
        durationDays: parseInt(String(body.durationDays), 10) || 3,
        season: body.season,
        budgetLevel: body.budgetLevel || 'Standard',
        specialNeeds: body.specialNeeds || '',
        selectedInterests: Array.isArray(body.selectedInterests) ? body.selectedInterests : [],
      };

      const result = await composerService.composeJourney(intent);
      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      console.error('[JourneyController.compose] Error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Journey composition failed' });
    }
  }

  public static async list(req: Request, res: Response) {
    try {
      const { status, limit } = req.query;
      const where: any = {};
      if (status) {
        where.status = String(status);
      }

      const journeys = await prisma.journey.findMany({
        where,
        include: {
          customer: true,
          _count: {
            select: { itineraries: true, approvals: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit ? parseInt(String(limit), 10) : 50,
      });

      return res.json({ success: true, data: journeys });
    } catch (err: any) {
      console.error('[JourneyController.list] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch journeys' });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const journey = await prisma.journey.findUnique({
        where: { journey_id: id },
        include: {
          customer: true,
          itineraries: {
            include: {
              module: {
                include: {
                  supplier: true,
                },
              },
            },
            orderBy: [{ day_number: 'asc' }, { sort_order: 'asc' }],
          },
          approvals: {
            orderBy: { created_at: 'desc' },
          },
          validated_by: {
            select: { full_name: true, email: true, role: true },
          },
        },
      });

      if (!journey) {
        return res.status(404).json({ success: false, error: 'Journey not found' });
      }

      return res.json({ success: true, data: journey });
    } catch (err: any) {
      console.error('[JourneyController.getById] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch journey details' });
    }
  }

  public static async submitReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const journey = await prisma.journey.findUnique({ where: { journey_id: id } });
      if (!journey) {
        return res.status(404).json({ success: false, error: 'Journey not found' });
      }

      const updated = await prisma.journey.update({
        where: { journey_id: id },
        data: {
          status: 'OPS_REVIEW',
          operator_notes: 'Submitted for human operations review and real-slot validation.',
        },
      });

      await prisma.approval.create({
        data: {
          journey_id: id,
          reviewer_name: 'Customer Request Submission',
          from_status: journey.status,
          to_status: 'OPS_REVIEW',
          decision: 'SUBMITTED_FOR_REVIEW',
          comments: 'Customer requested human validation of draft itinerary.',
          slot_checked: false,
          pricing_checked: false,
          safety_checked: false,
        },
      });

      return res.json({ success: true, data: updated, message: 'Journey submitted to Prime Assist Operations Desk' });
    } catch (err: any) {
      console.error('[JourneyController.submitReview] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to submit review' });
    }
  }

  public static async validate(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { decision, comments, slotChecked, pricingChecked, safetyChecked } = req.body;

      if (!['APPROVED', 'REJECTED', 'CONFIRMED'].includes(decision)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Decision must be APPROVED, REJECTED, or CONFIRMED' 
        });
      }

      const journey = await prisma.journey.findUnique({ where: { journey_id: id } });
      if (!journey) {
        return res.status(404).json({ success: false, error: 'Journey not found' });
      }

      const reviewerName = req.user?.fullName || 'Senior Operations Specialist';
      const reviewerUserId = req.user?.userId || null;

      const updated = await prisma.journey.update({
        where: { journey_id: id },
        data: {
          status: decision,
          operator_notes: comments || `Updated to ${decision} by ${reviewerName}`,
          validated_by_user_id: reviewerUserId,
        },
      });

      const approval = await prisma.approval.create({
        data: {
          journey_id: id,
          reviewer_user_id: reviewerUserId,
          reviewer_name: reviewerName,
          from_status: journey.status,
          to_status: decision,
          decision,
          comments: comments || `Operator action: ${decision}`,
          slot_checked: Boolean(slotChecked),
          pricing_checked: Boolean(pricingChecked),
          safety_checked: Boolean(safetyChecked),
        },
      });

      return res.json({
        success: true,
        data: {
          journey: updated,
          approval,
        },
        message: `Journey successfully marked as ${decision}`,
      });
    } catch (err: any) {
      console.error('[JourneyController.validate] Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to validate journey' });
    }
  }
}
