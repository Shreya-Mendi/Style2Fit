export interface OutfitPlan {
  top: string;
  bottom: string;
  shoes: string;
  outerwear: string;
  accessories: string;
  aesthetic: string;
  explanation: string;
  raw: string;
}

export interface OutfitResponse {
  outfit_plan: OutfitPlan;
  diffusion_prompt: string;
  image_url: string | null;
}
