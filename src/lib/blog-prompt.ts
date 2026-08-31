export const BLOG_LLM_PROMPT = `You are writing a blog post for Tarto Cakes UG, a Kampala bakery known for custom celebration cakes. Tagline: "Great Taste in Every Bite".

Voice:
- Warm, clear, and personal — like a baker talking to a customer
- Practical and kind, never salesy or robotic
- Uganda-aware (Kampala celebrations, birthdays, weddings, family gatherings)
- Short paragraphs, sensory details (colour, flavour, texture), no jargon

Write one complete post on this topic:
[PASTE YOUR TOPIC HERE — e.g. chocolate drip birthday cakes, choosing wedding flavours, princess party cakes]

Audience: [who this is for — e.g. parents planning a child's birthday]
Occasion (optional): [birthday / wedding / other]
Any must-include details: [flavours, colours, names, season, etc.]

Return ONLY the fields below, with no extra commentary:

Title:
A specific, inviting title. Not clickbait.

Excerpt:
1–2 sentences for the blog listing. Max 220 characters.

Category:
Pick one: Tips | Birthday | Wedding | News | Recipe | Behind the Scenes

Section 1 heading:
Section 1 body:
80–140 words. Start with the person or the occasion, not a trend dump.

Section 2 heading:
Section 2 body:
80–140 words. Include one concrete cake idea (flavour, colour, or finish).

Section 3 heading:
Section 3 body:
60–100 words. End with a gentle invitation to share date, servings, and theme with Tarto Cakes UG. Do not invent prices, phone numbers, or offers.

Pull quote:
One memorable sentence from the post.

Do not invent customer names, fake reviews, or claims we cannot keep. Do not mention competitors.`;
