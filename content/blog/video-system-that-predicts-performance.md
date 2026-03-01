---
title: "I Built a Video System That Predicts Performance Before Publishing"
description: Most content pipelines generate and post. Mine scores topics against historical performance data before generating anything. Here's how the ML prediction layer works.
date: 2026-03-23
tags: [machine-learning, automation, content, indie-hacking]
draft: false
---

Most automated content pipelines have the same flow: pick a topic, generate content, post it, measure the result. The measurement happens after publication.

Mine measures before.

The Content Creator system I built for Lunary scores each video topic against historical performance data before spending any generation time on it. Topics that the model predicts will perform well get prioritised. Topics that don't get deprioritised or dropped.

Here's how that prediction layer works.

## The problem it solves

I generate TikTok and Instagram Reels content for Lunary at scale. At first, the topic selection was roughly uniform across categories: moon phases, zodiac signs, numerology, crystals, tarot. A mix of everything.

Turns out the mix doesn't perform equally. Numerology content (angel numbers, life path numbers) consistently outperforms moon content on TikTok. Zodiac content performs well on Instagram but weaker on TikTok. Crystal content has high saves but low initial views.

Without a prediction layer, you either discover this slowly through manual analysis or keep generating the underperforming topics at the same rate as the good ones.

## The data

Every published video generates a performance record:

```typescript
interface VideoPerformance {
  videoId: string;
  topic: string;
  category: string; // 'numerology' | 'zodiac' | 'moon' | 'crystal' | 'tarot'
  platform: 'tiktok' | 'instagram';
  publishedAt: Date;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watchTimePercent: number; // average % of video watched
  engagementRate: number;   // (likes + comments + shares) / views
}
```

After a few months of publishing, you have a meaningful dataset. A few hundred records is enough to start seeing patterns.

## Feature extraction

The prediction model takes features derived from the topic and context, not the video content itself (that doesn't exist yet at prediction time):

```typescript
function extractFeatures(
  topic: string,
  category: string,
  platform: string,
  scheduledFor: Date,
): number[] {
  return [
    // Category encoding (one-hot)
    category === 'numerology' ? 1 : 0,
    category === 'zodiac' ? 1 : 0,
    category === 'moon' ? 1 : 0,
    category === 'crystal' ? 1 : 0,
    category === 'tarot' ? 1 : 0,

    // Platform
    platform === 'tiktok' ? 1 : 0,

    // Temporal features
    scheduledFor.getDay() / 6,          // day of week (0-1)
    scheduledFor.getHours() / 23,       // hour of day (0-1)
    (scheduledFor.getMonth() + 1) / 12, // month (0-1)

    // Recent performance of this category on this platform
    recentCategoryAvgEngagement(category, platform, 30), // last 30 days
    recentCategoryAvgViews(category, platform, 30),
  ];
}
```

The recent category averages are the most predictive features. If zodiac content on Instagram has been performing well over the past 30 days, new zodiac content is more likely to continue that trend.

## The model

The prediction model is a simple gradient boosting regressor, trained on the historical performance records. The target variable is `engagementRate`.

```python
from sklearn.ensemble import GradientBoostingRegressor
import numpy as np

# Training
X = np.array([extract_features(r) for r in training_records])
y = np.array([r['engagementRate'] for r in training_records])

model = GradientBoostingRegressor(
    n_estimators=100,
    max_depth=4,
    learning_rate=0.1,
)
model.fit(X, y)

# Prediction
def predict_performance(topic, category, platform, scheduled_for):
    features = extract_features(topic, category, platform, scheduled_for)
    return model.predict([features])[0]
```

The model retrained weekly on the last 90 days of data. Older data drops off to keep the predictions current with platform algorithm changes.

## The scoring queue

Before any generation happens, topics are scored and sorted:

```typescript
async function buildGenerationQueue(
  candidates: TopicCandidate[],
  platform: string,
  scheduledFor: Date,
): Promise<TopicCandidate[]> {
  const scored = await Promise.all(
    candidates.map(async (candidate) => ({
      ...candidate,
      predictedScore: await predictPerformance(
        candidate.topic,
        candidate.category,
        platform,
        scheduledFor,
      ),
    }))
  );

  return scored
    .sort((a, b) => b.predictedScore - a.predictedScore)
    .slice(0, DAILY_GENERATION_LIMIT);
}
```

Only the top-scoring candidates get generated. This means generation capacity goes toward the topics most likely to perform, rather than being distributed evenly.

## What the model learned

After six months of data, the clearest patterns:

- **Numerology content** (angel numbers especially) has the highest engagement rate on TikTok by a significant margin. The 1111, 222, 333 format performs well regardless of production quality.
- **Zodiac content** performs better on Instagram than TikTok. Instagram's algorithm seems to favour saves, and zodiac content gets saved at a higher rate.
- **Moon content** is consistent but not exceptional on either platform. It has a loyal audience but doesn't spike.
- **Crystal content** has high saves but low views. It performs well for SEO-adjacent metrics but doesn't drive subscriber growth.
- **Day of week matters more than time of day.** Tuesday and Wednesday outperform weekends for astrology content on both platforms.

The model now weights the generation queue heavily toward numerology content on TikTok and zodiac content on Instagram, which has measurably improved aggregate engagement rates.

## What it doesn't do

The model predicts category-level performance, not individual video performance. A high-scoring topic can still produce a weak video if the script is poor or the visual treatment is off. The prediction layer reduces bad topic selection; it doesn't guarantee good execution.

The generation layer (Claude for script, Remotion for visuals) is still the variable that determines individual video quality. The prediction layer just means that layer is being pointed at the right targets.

---

*I'm Sammii, founder of [Lunary](https://lunary.app) and indie developer building tools I actually want to use. I write about shipping products solo, the technical decisions behind them, and figuring it all out in public.*
