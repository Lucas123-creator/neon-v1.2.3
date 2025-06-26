import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const assetsRouter = createTRPCRouter({
  // Get all assets with filtering
  getAssets: publicProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        type: z.enum(['image', 'video', 'copy', 'text']).optional(),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        campaignId: z.string().optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { agentId, type, status, campaignId, tags, limit, offset } = input
      
      const where: any = {}
      
      if (agentId) where.agentId = agentId
      if (type) where.type = type
      if (status) where.status = status
      if (campaignId) where.campaignId = campaignId
      if (tags && tags.length > 0) {
        where.tags = {
          hasSome: tags,
        }
      }

      const [assets, total] = await Promise.all([
        ctx.prisma.asset.findMany({
          where,
          include: {
            agent: true,
            parent: true,
            revisions: true,
            _count: {
              select: {
                revisions: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.asset.count({ where }),
      ])

      return {
        assets,
        total,
        hasMore: offset + limit < total,
      }
    }),

  // Create a new asset
  createAsset: publicProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        type: z.enum(['image', 'video', 'copy', 'text']),
        title: z.string(),
        content: z.string().optional(),
        url: z.string().optional(),
        campaignId: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.asset.create({
        data: {
          ...input,
          tags: input.tags || [],
        },
        include: {
          agent: true,
        },
      })
    }),

  // Revise an existing asset
  reviseAsset: publicProcedure
    .input(
      z.object({
        parentId: z.string(),
        title: z.string(),
        content: z.string().optional(),
        url: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { parentId, notes, ...revisionData } = input
      
      const parent = await ctx.prisma.asset.findUnique({
        where: { id: parentId },
      })
      
      if (!parent) {
        throw new Error('Parent asset not found')
      }

      return await ctx.prisma.asset.create({
        data: {
          ...revisionData,
          type: parent.type,
          agentId: parent.agentId,
          campaignId: parent.campaignId,
          tags: parent.tags,
          parentId,
          status: 'pending',
        },
        include: {
          agent: true,
          parent: true,
        },
      })
    }),

  // Approve an asset
  approveAsset: publicProcedure
    .input(
      z.object({
        id: z.string(),
        approvedBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.asset.update({
        where: { id: input.id },
        data: {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: input.approvedBy,
          rejectedAt: null,
          rejectedBy: null,
        },
      })
    }),

  // Reject an asset
  rejectAsset: publicProcedure
    .input(
      z.object({
        id: z.string(),
        rejectedBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.asset.update({
        where: { id: input.id },
        data: {
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy: input.rejectedBy,
          approvedAt: null,
          approvedBy: null,
        },
      })
    }),

  // Get asset by ID with full details
  getAssetById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.asset.findUnique({
        where: { id: input.id },
        include: {
          agent: true,
          parent: true,
          revisions: {
            include: {
              agent: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })
    }),

  // Get available tags for filtering
  getTags: publicProcedure.query(async ({ ctx }) => {
    const assets = await ctx.prisma.asset.findMany({
      select: {
        tags: true,
      },
    })
    
    const allTags = assets.flatMap(asset => asset.tags)
    const uniqueTags = [...new Set(allTags)]
    
    return uniqueTags.sort()
  }),

  // Delete an asset
  deleteAsset: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete all revisions first
      await ctx.prisma.asset.deleteMany({
        where: { parentId: input.id },
      })
      
      // Then delete the asset
      return await ctx.prisma.asset.delete({
        where: { id: input.id },
      })
    }),
}) 