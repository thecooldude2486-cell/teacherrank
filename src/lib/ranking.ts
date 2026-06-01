// Weighted ranking score (Bayesian average) that balances rating quality with
// number of approved reviews. Items with fewer than MIN_REVIEWS approved
// reviews are pushed to the bottom of rankings (but still displayed).
//
// score = (count / (count + m)) * avg + (m / (count + m)) * C
//   m = smoothing weight (prior strength)
//   C = prior mean (assumed average across the platform)

export const MIN_REVIEWS = 3;
const PRIOR_WEIGHT = 10;
const PRIOR_MEAN = 3.5;

export function rankingScore(avg: number, count: number): number {
  if (count < MIN_REVIEWS) return -1; // sort below everything with enough reviews
  const m = PRIOR_WEIGHT;
  const C = PRIOR_MEAN;
  return (count / (count + m)) * avg + (m / (count + m)) * C;
}
