import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';

export const maxDuration = 30;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { messages } = await req.json();

  const result = streamText({
    // FIXED: Switched to 'gemini-1.5-pro' for better stability and tool-use accuracy
    model: google('gemini-1.5-pro'),
    system: `You are Pulse Bot, an intelligent CRM assistant. 
    Your goal is to manage the user's business data efficiently.
    
    Current User ID: ${user.id}
    Current Date: ${new Date().toISOString()}
    
    Rules:
    1. If the user mentions money spent, use createExpense.
    2. If the user mentions a new client or project revenue, use createDeal.
    3. If the user mentions a reminder or todo, use createTask.
    4. You can perform multiple actions in one turn (e.g. create a deal AND a task).
    5. Be concise and friendly. Always confirm what you just created.`,
    
    messages,
    maxSteps: 5, // Allows the AI to execute tools (Action) and then reply (Talk)
    
    tools: {
      // TOOL 1: Create Task
      createTask: tool({
        description: 'Create a new task or reminder',
        parameters: z.object({
          title: z.string().describe('The task description'),
          dueDate: z.string().optional().describe('ISO date string for deadline'),
          priority: z.number().optional().default(1),
        }),
        execute: async ({ title, dueDate, priority }) => {
          try {
            const task = await prisma.task.create({
              data: {
                title,
                dueDate: dueDate ? new Date(dueDate) : null,
                priority,
                userId: user.id,
                status: 'TO_DO'
              }
            });
            return `Success: Task "${task.title}" created.`;
          } catch (e) {
            return `Error creating task: ${e}`;
          }
        },
      }),

      // TOOL 2: Create Deal
      createDeal: tool({
        description: 'Create a new sales deal or project',
        parameters: z.object({
          title: z.string().describe('Deal name (e.g. Company Name - Project)'),
          amount: z.number().describe('Value of the deal'),
          status: z.enum(['OPEN', 'WON', 'PENDING', 'NEGOTIATION']).default('OPEN'),
        }),
        execute: async ({ title, amount, status }) => {
          try {
            const deal = await prisma.deal.create({
              data: {
                title,
                amount,
                status: status as any,
                userId: user.id
              }
            });
            return `Success: Deal "${deal.title}" created for $${deal.amount}.`;
          } catch (e) {
            return `Error creating deal: ${e}`;
          }
        },
      }),

      // TOOL 3: Create Expense
      createExpense: tool({
        description: 'Log a business expense',
        parameters: z.object({
          description: z.string(),
          amount: z.number(),
          category: z.enum(['LABOR', 'SOFTWARE', 'MATERIAL', 'TRAVEL', 'OTHER']).default('OTHER'),
        }),
        execute: async ({ description, amount, category }) => {
          try {
            const expense = await prisma.expense.create({
              data: {
                description,
                amount,
                category: category as any,
                userId: user.id
              }
            });
            return `Success: Expense logged: $${amount} for ${description}.`;
          } catch (e) {
            return `Error creating expense: ${e}`;
          }
        },
      }),
    },
  });

  // Use toTextStreamResponse as the compatible response format
  return result.toTextStreamResponse();
}