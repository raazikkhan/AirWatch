import type { User } from "@/interfaces/user";

interface AIRequestData {
  currentAQI?: number;
  completedChallenges?: number;
  daysTracked?: number;
}

export class AIAgent {
  private userProfile: User;

  constructor(UserProfile: User) {
    this.userProfile = UserProfile;
  }

  private async fetchFromAI(action: string, data: AIRequestData = {}) {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          userProfile: this.userProfile,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error in ${action}:`, error);
      throw error;
    }
  }

  async getPersonalizedRecommendations(currentAQI: number): Promise<string[]> {
    try {
      const { recommendations } = await this.fetchFromAI("recommendations", {
        currentAQI,
      });
      return recommendations.length > 3
        ? recommendations.slice(1)
        : recommendations;
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [
        "Stay indoors during peak pollution hours",
        "Use air purifiers when at home",
        "Wear a mask when going outside",
      ];
    }
  }

  async getDailyChallenge(currentAQI: number): Promise<string> {
    try {
      const { challenge } = await this.fetchFromAI("dailyChallenge", {
        currentAQI,
      });
      return challenge;
    } catch (error) {
      console.error("Error getting daily challenge:", error);
      return "Use public transport instead of personal vehicle today";
    }
  }
}
