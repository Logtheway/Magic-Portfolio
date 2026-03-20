'use server';
/**
 * @fileOverview An AI agent that analyzes Magic: The Gathering game outcomes
 * and provides strategic insights.
 *
 * - aiStrategicInsight - A function that handles the strategic insight generation process.
 * - AiStrategicInsightInput - The input type for the aiStrategicInsight function.
 * - AiStrategicInsightOutput - The return type for the aiStrategicInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlayerGameOutcomeSchema = z.object({
  playerName: z.string().describe("The name of the player."),
  commanderName: z.string().describe("The name of the commander played by this player in the game."),
  colorIdentity: z.string().describe("The color identity of the commander played by this player (e.g., 'WUBRG', 'Red-Green', 'Mono-Black')."),
  isUser: z.boolean().describe("True if this player is the user requesting the insight."),
});

const GameOutcomeSchema = z.object({
  gameId: z.string().describe("Unique identifier for the game."),
  players: z.array(PlayerGameOutcomeSchema).describe("List of players in the game and their details."),
  winnerPlayerName: z.string().describe("The name of the player who won this game."),
});

const AiStrategicInsightInputSchema = z.object({
  userName: z.string().describe("The name of the user requesting the strategic insight."),
  gameHistory: z.array(GameOutcomeSchema).describe("A historical list of game outcomes for the user and their group."),
});
export type AiStrategicInsightInput = z.infer<typeof AiStrategicInsightInputSchema>;

const AiStrategicInsightOutputSchema = z.object({
  strategicSuggestions: z.string().describe("Personalized strategic suggestions for the user to improve gameplay."),
  commanderSynergies: z.string().describe("Insights into commander synergies observed in the game history, especially those relevant to the user's commanders or common group commanders."),
  tacticalPatterns: z.string().describe("Identification of common tactical patterns, including successful strategies and potential pitfalls, observed across the games."),
});
export type AiStrategicInsightOutput = z.infer<typeof AiStrategicInsightOutputSchema>;

export async function aiStrategicInsight(input: AiStrategicInsightInput): Promise<AiStrategicInsightOutput> {
  return aiStrategicInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStrategicInsightPrompt',
  input: {schema: AiStrategicInsightInputSchema},
  output: {schema: AiStrategicInsightOutputSchema},
  prompt: `You are an expert Magic: The Gathering strategy analyst. Your task is to analyze the provided game history for the user named "{{{userName}}}" and generate personalized strategic suggestions, highlight commander synergies, and identify common tactical patterns.

Focus your analysis on the games involving "{{{userName}}}", but also consider broader group trends to provide comparative insights.

When analyzing, pay attention to:
- What commanders "{{{userName}}}" plays and their win rates with those commanders.
- What color identities "{{{userName}}}" uses and their effectiveness.
- What commanders or color identities are common winners in the group.
- Any observable patterns in game outcomes (e.g., certain commanders always winning against others, specific deck archetypes performing well).
- How "{{{userName}}}" could adjust their strategy or deck-building based on these observations.

---
User Name: {{{userName}}}

Game History:
{{#each gameHistory}}
  Game ID: {{{gameId}}}
  Players:
  {{#each players}}
    - Name: {{{playerName}}}, Commander: {{{commanderName}}}, Color Identity: {{{colorIdentity}}} {{#if isUser}}(USER){{/if}}
  {{/each}}
  Winner: {{{winnerPlayerName}}}
---
{{/each}}
`
});

const aiStrategicInsightFlow = ai.defineFlow(
  {
    name: 'aiStrategicInsightFlow',
    inputSchema: AiStrategicInsightInputSchema,
    outputSchema: AiStrategicInsightOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
