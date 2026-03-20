'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate a natural language summary
 * of Magic: The Gathering performance data for either an individual player or a group.
 *
 * - generatePerformanceSummary - A function that generates a performance summary.
 * - PerformanceSummaryGeneratorInput - The input type for the generatePerformanceSummary function.
 * - PerformanceSummaryGeneratorOutput - The return type for the generatePerformanceSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PerformanceSummaryGeneratorInputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('individual').describe("Indicates individual player performance data."),
    playerName: z.string().describe("The name of the individual player."),
    overallWinRate: z.number().min(0).max(1).describe("The overall win rate of the player (0-1)."),
    commanderWinRates: z.record(z.string(), z.number().min(0).max(1))
      .describe("A map of commander names to their win rates (0-1)."),
    colorComboWinRates: z.record(z.string(), z.number().min(0).max(1))
      .describe("A map of color combinations to their win rates (0-1)."),
    totalGamesPlayed: z.number().int().min(0).describe("Total games played by the individual."),
  }).describe("Input for an individual player's performance summary."),
  z.object({
    type: z.literal('group').describe("Indicates group performance data."),
    groupName: z.string().describe("The name of the group."),
    topPlayers: z.array(z.object({
      name: z.string().describe("Player name"),
      winRate: z.number().min(0).max(1).describe("Win rate for this player (0-1)."),
    })).describe("List of top performing players in the group."),
    topCommanders: z.array(z.object({
      name: z.string().describe("Commander name"),
      winRate: z.number().min(0).max(1).describe("Win rate for this commander (0-1)."),
    })).describe("List of top performing commanders in the group."),
    topColorCombos: z.array(z.object({
      name: z.string().describe("Color combination"),
      winRate: z.number().min(0).max(1).describe("Win rate for this color combination (0-1)."),
    })).describe("List of top performing color combinations in the group."),
    totalGamesPlayedInGroup: z.number().int().min(0).describe("Total games played in the group."),
  }).describe("Input for a group's performance summary."),
]);
export type PerformanceSummaryGeneratorInput = z.infer<typeof PerformanceSummaryGeneratorInputSchema>;

const PerformanceSummaryGeneratorOutputSchema = z.object({
  summary: z.string().describe("A natural language summary of the performance trends and statistical highlights."),
});
export type PerformanceSummaryGeneratorOutput = z.infer<typeof PerformanceSummaryGeneratorOutputSchema>;

export async function generatePerformanceSummary(input: PerformanceSummaryGeneratorInput): Promise<PerformanceSummaryGeneratorOutput> {
  return performanceSummaryGeneratorFlow(input);
}

const performanceSummaryPrompt = ai.definePrompt({
  name: 'performanceSummaryPrompt',
  input: { schema: PerformanceSummaryGeneratorInputSchema },
  output: { schema: PerformanceSummaryGeneratorOutputSchema },
  prompt: `You are an expert Magic: The Gathering statistician and analyst. Your goal is to provide a concise, natural language summary of the provided performance data, highlighting key trends and statistical insights. Make it engaging and easy to understand for a Magic: The Gathering player.

Use the following data:

{{#if (eq type "individual")}}
  Data Type: Individual Player Performance
  Player Name: {{{playerName}}}
  Overall Win Rate: {{overallWinRate}}
  Total Games Played: {{totalGamesPlayed}}
  Commander Win Rates:
  {{#each commanderWinRates}}
    - {{{@key}}}: {{this}}
  {{/each}}
  Color Combination Win Rates:
  {{#each colorComboWinRates}}
    - {{{@key}}}: {{this}}
  {{/each}}

  Based on the above, generate a concise summary of {{{playerName}}}'s performance, focusing on their overall win rate, their most successful and least successful commanders and color combinations, and any noticeable trends. Format win rates as percentages.
{{else if (eq type "group")}}
  Data Type: Group Performance
  Group Name: {{{groupName}}}
  Total Games Played in Group: {{totalGamesPlayedInGroup}}
  Top Performing Players:
  {{#each topPlayers}}
    - Name: {{{name}}}, Win Rate: {{winRate}}
  {{/each}}
  Top Performing Commanders:
  {{#each topCommanders}}
    - Name: {{{name}}}, Win Rate: {{winRate}}
  {{/each}}
  Top Performing Color Combinations:
  {{#each topColorCombos}}
    - Name: {{{name}}}, Win Rate: {{winRate}}
  {{/each}]

  Based on the above, generate a concise summary of the {{{groupName}}}'s performance, focusing on the top players, commanders, and color combinations, and any overall group trends. Format win rates as percentages.
{{/if}}`,
});

const performanceSummaryGeneratorFlow = ai.defineFlow(
  {
    name: 'performanceSummaryGeneratorFlow',
    inputSchema: PerformanceSummaryGeneratorInputSchema,
    outputSchema: PerformanceSummaryGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await performanceSummaryPrompt(input);
    return output!;
  }
);
