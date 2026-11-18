# Campus Stores

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

## For reviewers: my answer to the brief

**Would I keep this product? Yes.** The desk gets the hard rules right: it won't let the wrong equipment leave. What I would change is what happens *after* a kit leaves. A loan slip records who signed for a unit, but not where the unit is now. Once the Film Society's kit came back in pieces, the slips stopped describing reality.

My change makes **the loan slip follow the unit, not just the signature**. The prototype is in this fork's `app.js` and `styles.css`; open `index.html` and click **Restart sample shift** to try it.

| Commit | What it does |
|---|---|
| [`e309d73`](https://github.com/Adarsh-AV/campus-stores/commit/e309d73) | **Friday evening:** record on the slip who has an unreturned unit and when it's coming back |
| [`24bf564`](https://github.com/Adarsh-AV/campus-stores/commit/24bf564) | **Saturday morning:** overdue and expected badges, a "Unit in hand" lookup, and a tag check before a slip can close |
| [`ca56608`](https://github.com/Adarsh-AV/campus-stores/commit/ca56608) | **Friday pickup:** issue the whole approved kit from one form (a smaller, supporting fix) |

### A moment the product handles well: it won't let the wrong unit leave

At 3:45 pm I tried to put the **Wireless microphone** on the Film Society's request (RQ-214). The desk refused: *"This equipment type is outside the approved request."* When I tried to issue a second projector against the same request, it refused again: *"The approved quantity of this equipment type is already on loan."* The projector in the workshop (PR-06) was never offered at all.

These are exactly the rules a busy student volunteer would break under time pressure, and the product enforces them without anyone having to remember them. **I kept all of these checks.** The new kit form enforces them by construction: it only lists approved items and available units.

### A moment I would change: closing Leela's adapter the next morning

At 7:30 pm Kabir returned the projector and speaker and told me Leela had the adapter and would bring it at 9 am. In the register, my only options on the adapter's slip were to leave it open or to **Record return**. The slip still read `L-404 · AD-12 · RQ-214 · Kabir Sen · Due Fri 8 pm`. It didn't say what the item was, didn't say Leela had it, and didn't say when it was coming back. The only place I could record that was a free-text note in the **Desk book**, separate from the slip.

At 9 am, as the new shift, I had to:

1. Open the Desk book to learn that something from the screening was outstanding and that Leela had it.
2. Go back to the register and work out that `AD-12` was the adapter. Nothing on the slip says "adapter", and nothing marked it as overdue.
3. Click **Record return**, which closed the slip in **one click with no check** that the adapter Leela handed me was AD-12. The desk owns two identical adapters, AD-12 and AD-15, in the same bin (C4). If she had handed over the wrong one, the record would say AD-12 was home while it was still out.

The information I needed existed at every step. It was just in the wrong place, and closing the slip relied on my memory, not on the record.

### The change, and the same job walked through with it

**Friday 3:45 pm, pickup.** From the request I click **Issue this kit**. One form lists the projector, speaker and adapter, each with a picker of available units and their bins. **Return by** is already set to Fri 8 pm from the request. I choose Kabir once and save, and the desk writes three slips, L-402 to L-404, one per unit as before.

**Friday 7:30 pm, partial return.** I click **Record return** on the projector and type `PR-04` from its label. The confirmation says *"Still out on RQ-214: SP-02 (Portable speaker), AD-12 (USB-C → HDMI adapter)."* I return the speaker the same way. On the adapter's slip I click **Still out**, choose **Leela Das**, choose **Sat 9 am**, and add a note. The slip now shows **"Now with Leela Das · back Sat 9 am"**, and the same update appears in the Desk book automatically.

**Saturday 9:00 am, morning shift.** I open the Loan register and the adapter is the top slip, marked **Overdue since Fri 8 pm** and **Expected now**, with "Now with Leela Das" underneath. Below it, the Debate Union mic shows **Due in 1 hr**. Leela hands me an adapter, and I type the tag on it into **Unit in hand**:

- If it reads `AD-12`, the slip opens with **Returned by: Leela Das** already chosen. I click **Close slip** and see *"AD-12 returned by Leela Das to bin C4. Slip L-404 closed. Everything on RQ-214 is back."*
- If it reads `AD-15`, I see *"AD-15 is not on loan. It should already be on the shelf in bin C4. Check you have the right unit."* The slip stays open.

I never had to open the Desk book to finish the job.

### What I kept

- **One slip per physical unit.** The kit form writes the same records as before.
- **The person who signed stays on the slip.** "Signed out to Kabir Sen" is never overwritten, because Kabir is still responsible. "Now with Leela Das" is added beside it.
- **All the issuing checks**: approved types only, approved quantity, nothing in repair.
- **The Desk book** as the place for free-text handover. It now also gets the slip updates automatically, so nobody has to type them twice.

**Trade-off:** a return now asks for the tag, which is one more step than a single click. That step is what prevents closing the wrong adapter's slip. At a real counter it would be a barcode scan.

### What I would watch at a real counter

When someone hands over **one piece of a split kit**, does the person on the counter close the right slip **without leaving the Loan register, opening the Desk book, or asking a colleague**? I'd count this over the next ten split-kit returns before and after the change. As a backstop, I'd compare the register against the shelves at the start of each morning shift and count closed slips whose unit isn't actually on the shelf. If the change helps, both numbers should drop.

---

## Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records.

## Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).
