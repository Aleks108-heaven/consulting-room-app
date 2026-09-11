#!/usr/bin/env python3
"""One-time content pass: add 5 more grounded prompts (2 openers, 2 reflect,
1 technique) to each of the 26 school/mode template banks in i18n/en.json,
each drawing on that school's actual documented concepts/techniques, so the
scripted engine has more variety and feels less repetitive. Idempotent: skips
a mode if its openers array already contains the first new line.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "i18n", "en.json")

ADD = {
"founders": {
  "openers": ["What would you notice if you slowed {topic} down to a single frame, the way a lab observation would?",
              "Separate the raw sensation in {topic} from the label you've already put on it."],
  "reflect": ["This might be less a fixed thing than a stream -- constantly becoming, not staying still.",
              "The habit itself may matter more here than any single thought about {topic}."],
  "technique": ["Try the stream-of-consciousness method: speak everything passing through awareness about {topic} for sixty seconds, unedited."]
},
"psychoanalytic": {
  "openers": ["What's the very first memory that surfaces when you let {topic} sit for a moment?",
              "If this were a dream you'd had last night, what would the dream-version of {topic} be hiding?"],
  "reflect": ["Transference happens outside the couch too -- who does this feel like all over again?",
              "A slip, a joke, a forgotten detail around {topic} is rarely just an accident."],
  "technique": ["Notice any resistance to going further with {topic} -- the discomfort itself is usually informative."]
},
"jungian": {
  "openers": ["What would your dreams have to say about {topic} if you asked them tonight?",
              "Where does {topic} touch on individuation -- becoming more fully who you actually are?"],
  "reflect": ["The Self is bigger than the ego currently arguing with {topic}.",
              "Setting the cause aside for a moment -- what meaningful coincidence surrounds {topic}?"],
  "technique": ["Try active imagination: let an image connected to {topic} move and speak on its own, and just watch."]
},
"adlerian": {
  "openers": ["What's the earliest memory you have that feels connected to this same feeling?",
              "Whose applause were you originally trying to earn with patterns like {topic}?"],
  "reflect": ["Early recollections aren't factual history so much as a mirror of your current style of life.",
              "Courage, not comfort, is usually what social interest actually asks of you here."],
  "technique": ["Try 'acting as if' you already belonged, for one day, and notice what {topic} does."]
},
"humanistic": {
  "openers": ["What would unconditional positive regard for yourself, right now, actually sound like?",
              "Is the person you're being around {topic} congruent with who you feel yourself to be underneath?"],
  "reflect": ["Empathy for yourself here matters as much as anyone else's would.",
              "The organism tends to move toward growth when the conditions are safe enough -- what would make this safer?"],
  "technique": ["Try simply restating {topic} back to yourself, without advice or judgment, the way a good listener would."]
},
"existential": {
  "openers": ["What would you regret not having said or done about {topic}, looking back from the end of your life?",
              "Where does {topic} brush up against the absurd -- the gap between what you want and what the world gives?"],
  "reflect": ["This anxiety may be existential guilt -- the cost of not living out a real possibility.",
              "Death isn't only an ending; awareness of it can sharpen what actually matters in {topic}."],
  "technique": ["Ask yourself plainly: if I fully accepted this is finite, would I still spend it on {topic} the same way?"]
},
"gestalt": {
  "openers": ["What's figure and what's ground right now -- what's loud, and what's quietly holding it up?",
              "Finish this out loud: 'What I'm not saying about {topic} is...'"],
  "reflect": ["That sounds like a retroflection -- doing to yourself what you'd rather do to someone else.",
              "Contact, not insight, is what actually closes unfinished business like {topic}."],
  "technique": ["Exaggerate the gesture or tone you're using right now about {topic} -- what does it reveal when amplified?"]
},
"behaviorist": {
  "openers": ["What reinforcement schedule keeps {topic} going -- constant, or only sometimes, which is often stronger?",
              "If a stranger only watched your actions around {topic}, what would they conclude you wanted?"],
  "reflect": ["Extinction bursts happen -- a behavior often gets worse right before it fades. Don't mistake that for failure.",
              "Pairing matters: what has {topic} become associated with, over time, that it wasn't originally?"],
  "technique": ["Try shaping: reward yourself for any small approximation toward the target behavior, not just the finished version."]
},
"socialcog": {
  "openers": ["What have you told yourself you're capable of here, out loud, versus silently?",
              "Which environment tends to pull the better version of this behavior out of you?"],
  "reflect": ["Vicarious learning counts -- who you watch shapes what you believe is possible.",
              "Outcome expectations and efficacy expectations are different things. Which one is actually shaky in {topic}?"],
  "technique": ["Try verbal self-guidance: coach yourself out loud through {topic} the way you'd coach someone you cared about."]
},
"devcog": {
  "openers": ["What's the more sophisticated version of this understanding that's just barely out of reach?",
              "Where did the rules you're using for {topic} come from, and do they still fit the problem?"],
  "reflect": ["Disequilibrium is uncomfortable, but it's usually the engine, not the enemy, of new understanding.",
              "You might be assimilating {topic} into an old category that no longer fits it."],
  "technique": ["Try building the next model up one step at a time, instead of leaping straight to the finished idea of {topic}."]
},
"cbt": {
  "openers": ["If we tested this thought about {topic} like a hypothesis, what experiment would tell us the truth?",
              "What's the worst that could realistically happen, and could you actually survive it?"],
  "reflect": ["Behavior change often comes before the feeling changes, not after -- act first, and the feeling can catch up.",
              "Safety behaviors around {topic} might be keeping the fear alive rather than protecting you from it."],
  "technique": ["Try a graded behavioral experiment: do a small version of the feared thing around {topic} and record what actually happens."]
},
"family": {
  "openers": ["What would change in the whole system if you refused to play your usual part in {topic}?",
              "Whose triangle are you being pulled into here?"],
  "reflect": ["Symptoms often serve the system -- what is {topic} quietly doing for the family as a whole?",
              "Boundaries, not distance, might be what's actually missing around {topic}."],
  "technique": ["Try a small, deliberate change in your part of the pattern, and watch what the rest of the system does in response."]
},
"socialpsych": {
  "openers": ["Is there a fundamental attribution error here -- are you blaming character where situation is the real cause?",
              "Is there a bystander effect at work -- are you waiting for someone else to act first?"],
  "reflect": ["Groupthink can make a bad decision feel unanimous and safe. Was there room for real dissent around {topic}?",
              "Attitudes tend to follow behavior, not just the other way around, once you've acted publicly on {topic}."],
  "technique": ["Try deliberately seeking one dissenting view on {topic} before deciding anything."]
},
"cogsci": {
  "openers": ["Is that a fast, automatic flash judgment about {topic}, or a slow, deliberate one?",
              "What would a brain scan of this moment probably show -- fear circuitry, or careful reasoning?"],
  "reflect": ["Confirmation bias might be doing some quiet work in how you're reading {topic}.",
              "The gap between what you expected and what happened is exactly what a brain tends to update on."],
  "technique": ["Try explicitly listing the base rate before trusting the vivid, memorable version of {topic}."]
},
"trait": {
  "openers": ["Would this trait show up the same way in a completely different context?",
              "Where do you sit on openness to experience, and how is that shaping {topic}?"],
  "reflect": ["Traits are dispositions, not destinies -- they set a range, not a fixed point.",
              "Strong situations flatten personality differences; weak ones let them show. Which is this?"],
  "technique": ["Try predicting your own reaction to {topic} from your usual traits, then check it against what actually happened."]
},
"positive": {
  "openers": ["What's your rough ratio of positive to negative moments around this?",
              "Where would {topic} rank if you measured it against your core values instead of your mood?"],
  "reflect": ["Savoring the good moments deliberately tends to build more resilience for hard ones like {topic}.",
              "Post-traumatic growth is real -- some people come out of exactly this kind of thing stronger, not just scarred."],
  "technique": ["Try a gratitude letter connected to {topic}, even if you never send it."]
},
"transpersonal": {
  "openers": ["Where does {topic} sit on the spectrum from ego concern to something more universal?",
              "If you saw {topic} from ten years in the future, spiritually speaking, what would it look like?"],
  "reflect": ["Peak experiences tend to reorganize what matters afterward. Has {topic} done that, or could it?",
              "Worth ruling out: are you transcending {topic}, or quietly avoiding it?"],
  "technique": ["Try holding {topic} in awareness the way you'd hold a koan -- not solving it, just sitting with the question."]
},
"psychodrama": {
  "openers": ["Who else needs a chair in this scene about {topic}?",
              "What would the audience -- the rest of your life -- say, watching this unfold?"],
  "reflect": ["Catharsis in action tends to move what talk alone leaves stuck.",
              "Doubling -- having someone voice your unspoken thought -- often surfaces the real line under {topic}."],
  "technique": ["Try 'mirroring': step outside the scene and watch yourself in it, as if you were in the audience."]
},
"somatic": {
  "openers": ["Is the sensation moving, or stuck, right now?",
              "What's your nervous system doing -- fight, flight, freeze, or settled?"],
  "reflect": ["The body keeps score even when the mind has already moved on from {topic}.",
              "Titration matters: a little of the sensation at a time is more useful than the whole flood at once."],
  "technique": ["Try 'pendulation': touch the edge of the sensation from {topic}, then deliberately return to something neutral, back and forth."]
},
"hypnonlp": {
  "openers": ["What's the submodality of {topic} -- is it loud or quiet, close or far, bright or dim, in your mind?",
              "If you could change just one of those qualities, what would shift?"],
  "reflect": ["The unconscious mind tends to solve problems it's given clean access to, without needing every detail argued out loud.",
              "Anchoring works both ways -- something is already anchoring this state; the question is whether you chose it."],
  "technique": ["Try future-pacing: imagine {topic} already resolved, in detail, and notice what's different in how you're standing, breathing, feeling."]
},
"ta": {
  "openers": ["Whose voice is that Critical Parent line about {topic} actually borrowed from?",
              "What stroke -- positive or negative attention -- is {topic} actually earning you?"],
  "reflect": ["Discounting happens when you minimize the size or importance of {topic} to avoid dealing with it.",
              "A racket feeling is a substitute for the real one you learned wasn't allowed. What's underneath the one you're showing?"],
  "technique": ["Try naming the exact stroke you wanted from {topic}, and ask for it directly instead of through the game."]
},
"buddhist_classical": {
  "openers": ["Which of the three characteristics is loudest in {topic} right now -- impermanence, unsatisfactoriness, or not-self?",
              "Where's the craving in {topic} -- the wanting of things to be other than they are?"],
  "reflect": ["The second arrow is the suffering we add on top of the first, unavoidable pain. How much of {topic} is the second arrow?",
              "Attachment to an outcome, more than the outcome itself, is often what's driving this."],
  "technique": ["Try noting practice: silently label what's happening in {topic} as 'thinking,' 'feeling,' or 'sensing,' as it arises."]
},
"kagyu_mahamudra": {
  "openers": ["What happens to {topic} the instant you stop trying to understand it and just look?",
              "Is there tension in the watching itself, in how you're looking at {topic}?"],
  "reflect": ["Even the effort to be non-effortful about {topic} is still effort. Can you see that too?",
              "Mind looking at mind never quite finds a thing to grasp. What did you find when you looked?"],
  "technique": ["Let the next arising of {topic} come and go completely on its own, the way a cloud crosses the sky, without you doing anything to it."]
},
"nyingma_dzogchen": {
  "openers": ["Before {topic} was labeled, what was simply there?",
              "Is awareness itself troubled by {topic}, or only its temporary weather?"],
  "reflect": ["This doesn't need to be different -- only seen nakedly, as it is.",
              "Does that shift how urgent {topic} feels, if nothing here actually needs fixing, only recognizing?"],
  "technique": ["Rest for a few breaths in bare awareness with the eyes softly open, letting {topic} appear and pass without editing it."]
},
"lamrim_kadam": {
  "openers": ["Where does {topic} sit relative to your motivation -- serving others' wellbeing, or only your own, right now?",
              "What would the small-scope, medium-scope, and great-scope view each say about {topic}?"],
  "reflect": ["Renunciation isn't rejection -- it's clarity about what actually causes lasting relief from something like {topic}.",
              "Even a hard thing like {topic} becomes useful material once it's held as practice, not just problem."],
  "technique": ["Try tonglen for one minute: breathe in the discomfort of {topic}, breathe out relief, for yourself and anyone else facing the same thing."]
},
"contemplative_science": {
  "openers": ["What would eight weeks of consistent practice around {topic} likely change, based on what the research shows?",
              "Is this reactivity, or is it responsiveness -- and what's the actual difference in this moment?"],
  "reflect": ["Neuroplasticity means the pattern in {topic} is more revisable than it feels right now.",
              "Interoception -- noticing the body's signals -- often front-runs the conscious story about {topic}."],
  "technique": ["Try labeling the emotion in one word, out loud, before reacting to {topic} -- affect labeling reliably calms the amygdala's response."]
},
}

with open(PATH, encoding="utf-8") as f:
    data = json.load(f)

changed = 0
for mode, add in ADD.items():
    m = data["modes"][mode]
    for bucket in ("openers", "reflect", "technique"):
        new_lines = [l for l in add.get(bucket, []) if l not in m[bucket]]
        if new_lines:
            m[bucket].extend(new_lines)
            changed += len(new_lines)

with open(PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
    f.write("\n")

print(f"Added {changed} new template lines across {len(ADD)} modes.")
