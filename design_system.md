# Design System Document: The Sacred Competitive Standard

## 1. Overview & Creative North Star: "The Digital Cathedral"
This design system moves away from the clinical "app-as-a-utility" look toward a "Digital Cathedral" experience. The goal is to balance the gravity of biblical tradition with the dopamine-driven excitement of high-stakes competition.

The Creative North Star is defined by **Layered Illumination**. Rather than using traditional grids and hard borders, we use light and tonal depth to guide the user. We break the "template" look through:
- **Intentional Asymmetry:** Strategic use of whitespace and "off-center" headline placements to evoke high-end editorial magazines.
- **Tonal Depth:** Utilizing the full spectrum of the `surface-container` tokens to create a sense of physical space and hierarchy.
- **Scholarly Polish:** Pairing a serif font that feels ancient and authoritative with a modern, technical sans-serif to create a "smart-gaming" aesthetic.

---

## 2. Colors: Spiritual Depth & Golden Rewards
The palette is rooted in the `primary` (Deep Purple) and `tertiary` (Gold) relationship, evoking royalty and divine wisdom.

**The "No-Line" Rule**
Prohibit the use of `1px solid` borders to define sections. Boundaries must be created via background shifts. Use `surface` as your base and `surface-container-low` for secondary sections. This creates a "soft-edge" interface that feels expensive and seamless.

**Surface Hierarchy & Nesting**
Treat the UI as a series of nested layers.
- **The Foundation:** `surface` (#faf9fc).
- **The Content Block:** `surface-container-low` (#f5f3f7) for large background areas.
- **The Interaction Layer:** `surface-container-lowest` (#ffffff) for the primary interactive cards to make them "pop" against the tinted background.

**The "Glass & Gradient" Rule**
To elevate the "Crown" aspect of the app, use a subtle linear gradient for primary CTAs: `primary` (#310065) transitioning to `primary-container` (#4a148c) at a 135-degree angle. 
For floating elements, use a "Froste Glass" effect:
- **Fill:** `surface-container-lowest` at 70% opacity.
- **Effect:** Background blur (20px - 30px).

---

## 3. Typography: Wisdom Meets Utility
The typography system uses a high-contrast scale to separate "Knowledge" from "Action."

- **Display & Headline (Noto Serif):** These are the "Voices of Tradition." Use these for quiz questions, biblical quotes, and major milestones. The serif adds weight and scholarly intent.
- **Title, Body & Label (Manrope):** These are the "Voices of the UI." Manrope’s geometric clarity ensures readability during fast-paced competitive play.

**Editorial Tip:** Use `display-lg` for single-digit score counts or crown tallies to give the numbers a monumental, prestigious feel.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often too "heavy" for a spiritual app. We use **Tonal Layering** to convey importance.

- **The Layering Principle:** Instead of shadows, place a `surface-container-lowest` card inside a `surface-container-high` section. The natural contrast creates the lift.
- **Ambient Shadows:** For floating action buttons or "Golden Rewards," use a shadow with a 24px blur, 0px spread, and 6% opacity of the `on-surface` color.
- **The "Ghost Border" Fallback:** If a divider is essential (e.g., in complex settings), use the `outline-variant` token at 15% opacity. It should be felt, not seen.
- **Glassmorphism:** Apply to navigation bars and top headers to allow the vibrant purple or gold backgrounds to bleed through, softening the transition between sections.

---

## 5. Components: Refined Interaction

**Buttons**
- **Primary:** Gradient fill (`primary` to `primary-container`), `on-primary` text, `xl` (1.5rem / rounded-2xl) corner radius. Use for "Start Quiz" or "Claim Crown."
- **Secondary (The Golden CTA):** `tertiary-container` fill with `on-tertiary-container` text. Use for high-value rewards or competitive upgrades.
- **Tertiary:** No fill. `primary` text with a `label-md` weight.

**Elegant Cards**
Cards must never have a dark border. Use `surface-container-lowest` against a `surface-container-low` background.
- **Rule:** Forbid the use of divider lines inside cards. Use vertical whitespace (1.5rem - 2rem) to separate a biblical quote from its reference.

**Progress & Crowns**
- **Progress Bars:** Use a `surface-container-highest` track with a `tertiary-fixed-dim` (Gold) fill. Add a subtle outer glow to the gold bar to represent "divine light."
- **Crown Icons:** Always use the `tertiary` (Gold) token. When a user wins, the crown should use a "Golden Glow" (a shadow using the `tertiary` color at 30% opacity).

**Checkboxes & Radio Buttons**
- Replace standard boxes with "Card-Select" patterns. An unselected option is `surface-container-low`. A selected option gains a 2px `tertiary` (Gold) "Ghost Border" and a subtle `tertiary-container` tint.

---

## 6. Do’s and Don'ts

### Do:
- **Do use extreme whitespace.** A scholarly app needs room to breathe.
- **Do use Noto Serif** for large numeric data (e.g., "Level 12") to make progress feel like an achievement.
- **Do use `surface-tint` at 5% opacity** for background overlays to keep the purple "vibe" alive even in white areas.

### Don't:
- **Don't use pure black (#000000).** Use `on-surface` (#1b1b1e) for all text to maintain the premium, soft-contrast look.
- **Don't use hard corners.** Every element should use at least the `DEFAULT` (0.5rem) or `lg` (1rem) radius to feel approachable. Button radii are even larger.
- **Don't use standard iOS blue for links.** Everything interactive must be `primary` (Purple) or `tertiary` (Gold).
