/* ------------------------------------------------------------------
   Evidence data for "Why the Sonics Left Seattle".
   Every card is paraphrased from the source it names. Edit here, not in app.js.
   voice: whose voice the source carries (owners | league | civic | press)
   hts:   the historical thinking skill the card helps demonstrate
   ------------------------------------------------------------------ */
window.DATA = (function () {
  const VOICES = {
    owners: "Owners",
    league: "NBA",
    civic: "Government & fans",
    press: "Press & commentary",
  };

  const THEMES = {
    PCE: "Politics and Power",
    WXT: "Work, Exchange and Technology",
    ARC: "American and Regional Culture",
  };

  /* ---------------- SOURCES (MLA) ---------------- */
  const SOURCES = {
    ap_bulletin: {
      short: "Associated Press, via The Bulletin (Bend)", year: "2008", kind: "News report (wire)",
      mla: "Associated Press. “Sonics’ Owner Pressed at Trial.” <i>The Bulletin</i> [Bend, OR], 18 June 2008, bendbulletin.com/?p=261229.",
      url: "https://bendbulletin.com/?p=261229",
    },
    ap_settle: {
      short: "Associated Press, via Action News 5", year: "2008", kind: "News report (wire)",
      mla: "---. “SuperSonics, Seattle Reach Last-Minute Settlement.” <i>Action News 5</i>, 3 July 2008, www.actionnews5.com/story/8613387/supersonics-seattle-reach-last-minute-settlement/.",
      url: "https://www.actionnews5.com/story/8613387/supersonics-seattle-reach-last-minute-settlement/",
    },
    ap_stern: {
      short: "Associated Press, via ESPN", year: "2008", kind: "News report (wire)",
      mla: "---. “Stern: Bennett Made ‘Good Faith’ Effort to Keep Sonics in Seattle.” <i>ESPN.com</i>, 14 Apr. 2008, www.espn.in/nba/news/story?id=3346600.",
      url: "https://www.espn.in/nba/news/story?id=3346600",
    },
    ap_leg07: {
      short: "Associated Press, via News On 6", year: "2007", kind: "News report (wire)",
      mla: "---. “Washington Lawmakers Won’t Vote on Sonics Arena This Session.” <i>News On 6</i>, 17 Apr. 2007, newson6.com/story/5e36884e2f69d76f6209e77b/washington-lawmakers-wont-vote-on-sonics-arena-this-session.",
      url: "https://newson6.com/story/5e36884e2f69d76f6209e77b/washington-lawmakers-wont-vote-on-sonics-arena-this-session",
    },
    balko: {
      short: "Radley Balko, Reason", year: "2008", kind: "Magazine commentary",
      mla: "Balko, Radley. “So Long, Seattle.” <i>Reason</i>, 1 May 2008, reason.com/2008/05/01/so-long-seattle/.",
      url: "https://reason.com/2008/05/01/so-long-seattle/",
    },
    booth: {
      short: "Tim Booth, on OPB’s Think Out Loud", year: "2026", kind: "Radio interview",
      mla: "Booth, Tim. Interview by Geoff Norcross. “What the Seattle Supersonics Relocation Can Teach Us about the Trail Blazers.” <i>Think Out Loud</i>, Oregon Public Broadcasting, 11 Aug. 2026, www.opb.org/article/2026/08/11/think-out-loud-seattle-supersonics-relocation-portland-trail-blazers/.",
      url: "https://www.opb.org/article/2026/08/11/think-out-loud-seattle-supersonics-relocation-portland-trail-blazers/",
    },
    brunner07: {
      short: "Jim Brunner, The Seattle Times", year: "2007", kind: "News explainer",
      mla: "Brunner, Jim. “The Facts, Figures behind the Flap over Sonics Arena.” <i>The Seattle Times</i>, 18 Feb. 2007, archive.seattletimes.com/archive/20070218/sonicsqampa18m/the-facts-figures-behind-the-flap-over-sonics-arena.",
      url: "https://archive.seattletimes.com/archive/20070218/sonicsqampa18m/the-facts-figures-behind-the-flap-over-sonics-arena",
    },
    brunner08: {
      short: "Brunner & Thomas, The Seattle Times", year: "2008", kind: "News report",
      mla: "Brunner, Jim, and Ralph Thomas. “Microsoft CEO May Chip in Millions to Keep Sonics.” <i>The Seattle Times</i>, 6 Mar. 2008, archive.seattletimes.com/archive/20080306/sonics06m/microsoft-ceo-may-chip-in-millions-to-keep-sonics.",
      url: "https://archive.seattletimes.com/archive/20080306/sonics06m/microsoft-ceo-may-chip-in-millions-to-keep-sonics",
    },
    seattlecenter: {
      short: "Seattle Center", year: "n.d.", kind: "City-affiliated website",
      mla: "“Climate Pledge Arena.” <i>Seattle Center</i>, seattlecenter.com/about/plans-and-projects/arena. Accessed 21 Oct. 2026.",
      url: "https://seattlecenter.com/about/plans-and-projects/arena",
    },
    eide: {
      short: "Andy Eide, NHL.com", year: "2021", kind: "League-site news report",
      mla: "Eide, Andy. “Kraken Arena Officially Opens with Ribbon-Cutting Ceremony.” <i>NHL.com</i>, 23 Oct. 2021, nhl.com/news/seattle-kraken-arena-ribbon-cutting-ceremony-327130118.",
      url: "https://nhl.com/news/seattle-kraken-arena-ribbon-cutting-ceremony-327130118",
    },
    fos: {
      short: "Field of Schemes", year: "2007", kind: "Advocacy blog",
      mla: "“Sonics Co-Owner: We Wanted OKC All Along – Wait, Are You Writing This Down?” <i>Field of Schemes</i>, 14 Aug. 2007, www.fieldofschemes.com/2007/08/14/1710/sonics-co-owner-we-wanted-okc-all-along-wait-are-you-writing-this-down/.",
      url: "https://www.fieldofschemes.com/2007/08/14/1710/sonics-co-owner-we-wanted-okc-all-along-wait-are-you-writing-this-down/",
    },
    fox13: {
      short: "Fox 13 Seattle (relaying ESPN)", year: "2026", kind: "Local TV news report",
      mla: "“NBA Expansion: Adam Silver Says Seattle SuperSonics Return ‘No Longer a Lock.’” <i>Fox 13 Seattle</i>, 16 Oct. 2026, www.fox13seattle.com/news/adam-silver-sonics.",
      url: "https://www.fox13seattle.com/news/adam-silver-sonics",
    },
    horsefeathers: {
      short: "The Seattle Times editorial", year: "2006", kind: "Newspaper editorial",
      mla: "“Horsefeathers: The Legacy of I-91.” <i>The Seattle Times</i>, 13 Nov. 2006, archive.seattletimes.com/archive/20061113/init91ed13/horsefeathers-the-legacy-of-i-91.",
      url: "https://archive.seattletimes.com/archive/20061113/init91ed13/horsefeathers-the-legacy-of-i-91",
    },
    kershner: {
      short: "Jim Kershner, HistoryLink", year: "2009", kind: "Encyclopedia essay",
      mla: "Kershner, Jim. “Seattle SuperSonics Play Final Home Game on April 13, 2008.” <i>HistoryLink.org</i>, Essay 8910, 31 Jan. 2009, www.historylink.org/file/8910.",
      url: "https://www.historylink.org/file/8910",
    },
    licata: {
      short: "Nick Licata, Seattle City Council blog", year: "2012", kind: "Government blog",
      mla: "Licata, Nick. “Perspectives on Initiative 91.” <i>Seattle City Council Blog</i>, 6 July 2012, council.seattle.gov/2012/07/06/perspectives-on-initiative-91/.",
      url: "https://council.seattle.gov/2012/07/06/perspectives-on-initiative-91/",
    },
    nba26: {
      short: "NBA Communications", year: "2026", kind: "League press release",
      mla: "NBA Communications. “NBA Board of Governors Approves Exploration of Expansion to Las Vegas and Seattle.” <i>NBA Communications</i>, 25 Mar. 2026, pr.nba.com/nba-board-of-governors-potential-expansion-las-vegas-seattle.",
      url: "https://pr.nba.com/nba-board-of-governors-potential-expansion-las-vegas-seattle/",
    },
    sleeper: {
      short: "John Sleeper, The Herald (Everett)", year: "2008", kind: "Opinion column",
      mla: "Sleeper, John. “Stern’s Still OK with Clay, despite Ugly E-mails.” <i>The Herald</i> [Everett, WA], 14 Apr. 2008, www.heraldnet.com/?p=282187.",
      url: "https://www.heraldnet.com/?p=282187",
    },
  };

  /* ---------------- CAUSES (the web) ---------------- */
  // weight = my provisional weighting, out of 100. links = arguments I am making, not facts.
  const CAUSES = [
    {
      id: "keyarena", name: "An aging KeyArena", short: "KeyArena", tiny: "Arena", weight: 8, theme: "WXT", when: "1990s onward",
      summary: "The building was remodeled cheaply in the early 1990s and lacked the revenue streams a modern NBA arena needs.",
      evidence: [
        { src: "booth", when: "Aug 2026", voice: "press", hts: "2C",
          text: "Says the early-1990s remodel was done cheaply and lacked revenue-generating amenities, and that modern arenas matter for league perception and shared revenue.",
          limit: "Said 18 years later, with hindsight, in the middle of Portland’s own arena debate." },
        { src: "kershner", when: "Jan 2009", voice: "press", hts: "3B",
          text: "Reports that Bennett said he wanted the Sonics to stay but needed a new arena, with the state or city paying much of the cost.",
          limit: "Reports the owner’s stated reason. It does not test whether that reason was sincere." },
      ],
      links: [{ to: "owners", label: "Gave the owners their stated reason for needing a new building." }],
    },
    {
      id: "attendance", name: "Falling popularity", short: "Popularity", tiny: "Fans", weight: 6, theme: "ARC", when: "2004–2007",
      summary: "Interest in the team had slipped, which weakened the case for asking taxpayers for money.",
      evidence: [
        { src: "kershner", when: "Jan 2009", voice: "press", hts: "3B",
          text: "Says state taxpayers were unwilling to fund an arena, especially for a team whose popularity and attendance had declined over the previous three years. The final home game still drew about 15,000.",
          limit: "A summary with no attendance figures. I still need the numbers." },
      ],
      links: [{ to: "state", label: "Taxpayers were less willing to pay for a team fewer people were watching." }],
    },
    {
      id: "i91", name: "Initiative 91", short: "I-91", tiny: "I-91", weight: 14, theme: "PCE", when: "Nov 2006",
      summary: "Seattle voters required the city to get a “fair value” return on any money it put into a pro sports facility. That closed the easiest public-money route.",
      evidence: [
        { src: "licata", when: "Jul 2012", voice: "civic", hts: "2C",
          text: "Confirms 74% of voters passed I-91 in 2006 and that it requires a “fair value” return on city investment in facilities for pro sports organizations.",
          limit: "A council member writing in 2012 about a different arena proposal, not about the 2008 move." },
        { src: "horsefeathers", when: "Nov 13, 2006", voice: "press", hts: "2B",
          text: "Called the measure “lousy policy” and warned it could push the Sonics out of Seattle, possibly out of the region.",
          limit: "A forecast, not proof of what happened. The paper also opposed the measure." },
        { src: "brunner07", when: "Feb 18, 2007", voice: "press", hts: "5B",
          text: "Notes the measure has no authority outside Seattle and does not bind the state Legislature or the King County Council.",
          limit: "This limits I-91’s reach. It closed the city route but not the state route." },
      ],
      links: [{ to: "state", label: "With the city route closed, the funding request went to the state (Feb 2007)." }],
    },
    {
      id: "state", name: "The state says no", short: "State", tiny: "State", weight: 22, theme: "PCE", when: "Apr 2007 and Mar 2008",
      summary: "Twice the legislature declined to put up public money: first for a new Renton arena, then for a KeyArena rebuild.",
      evidence: [
        { src: "brunner07", when: "Feb 18, 2007", voice: "press", hts: "3B",
          text: "Bennett asked for $300 million of state-authorized taxes, collected only in King County, toward a roughly $500 million arena in Renton (Senate Bill 5986).",
          limit: "An explainer that is mostly neutral, but it relays the backers’ claims." },
        { src: "ap_leg07", when: "Apr 17, 2007", voice: "press", hts: "5B",
          text: "The Legislature decided not to vote on the Renton plan after lawmakers met with Governor Gregoire and concluded there was not enough time before the April 22 end of session. Bennett said the team had “little hope of remaining in the Puget Sound region.”",
          limit: "Lawmakers said the issue was not dead, so “not enough time” may be a polite way of saying “not enough votes.”" },
        { src: "kershner", when: "Jan 2009", voice: "press", hts: "5B",
          text: "Says Governor Gregoire declined to call a special session, and that in March 2008 the Legislature adjourned without approving its share of a $300 million KeyArena plan.",
          limit: "A summary written soon after the move. It does not weigh which cause mattered most." },
        { src: "brunner08", when: "Mar 6, 2008", voice: "civic", hts: "6C",
          text: "House Majority Leader Lynn Kessler said of the late proposal, “I don’t see it happening.” The public money was available only if a group bought the team, and Bennett kept saying the Sonics were not for sale.",
          limit: "This suggests the dispute was about a deal the owner was not offering to take." },
      ],
      links: [{ to: "owners", label: "Closed the last public route, leaving the owners free to say they had tried." }],
    },
    {
      id: "owners", name: "The owners’ intent", short: "Owners", tiny: "Owners", weight: 30, theme: "WXT", when: "2006–2008",
      summary: "The group that bought the team was from Oklahoma City. The question is whether they ever meant to keep it in Seattle.",
      evidence: [
        { src: "ap_bulletin", when: "Jun 18, 2008", voice: "owners", hts: "6C",
          text: "In an April 17, 2007 email, partner Tom Ward asked whether the team could move “here for next season.” Bennett replied, “I am a man possessed!” Under oath, Bennett said he was reaffirming his commitment to the Seattle process, not answering a proposal to move.",
          limit: "Two readings of one email. The owner’s account is given under oath but is also self-interested." },
        { src: "ap_stern", when: "Apr 14, 2008", voice: "league", hts: "6C",
          text: "Reports that the emails discussed avoiding more “lame duck” seasons in Seattle before a move. NBA Commissioner David Stern said he was convinced Bennett made a good-faith effort, and that other partners may not have shared Bennett’s views.",
          limit: "Stern led the league that would vote on the move, so he had a stake in the answer." },
        { src: "fos", when: "Aug 14, 2007", voice: "owners", hts: "2C",
          text: "Reports that minority owner Aubrey McClendon told an Oklahoma City paper, “We didn’t buy the team to keep it in Seattle; we hoped to come here.” He then issued a statement saying the group had “exhaustively pursued every reasonable avenue” to keep the team.",
          limit: "A blog that opposes stadium subsidies, relaying a newspaper I have not read myself, so I need the original." },
        { src: "sleeper", when: "Apr 14, 2008", voice: "press", hts: "2C",
          text: "A columnist doubts that Stern could vouch for Bennett without reading the emails, and says they suggest the partners had no interest in keeping the team in Seattle.",
          limit: "An opinion column, not a news report." },
      ],
      links: [
        { to: "state", label: "If they meant to leave anyway, the legislature’s “no” mattered less (a counterfactual I’m testing)." },
        { to: "nba", label: "They filed the relocation request the league voted on." },
      ],
    },
    {
      id: "okc", name: "Oklahoma City’s offer", short: "OKC offer", tiny: "OKC", weight: 12, theme: "WXT", when: "Mar 2008",
      summary: "Oklahoma City gave the owners a place to go, with public money already voted.",
      evidence: [
        { src: "brunner08", when: "Mar 6, 2008", voice: "press", hts: "5B",
          text: "Reports that Oklahoma City voters approved $120 million in taxes for an arena upgrade and practice facility aimed at attracting the team.",
          limit: "Seattle reporters covering the Seattle side of the story." },
        { src: "balko", when: "May 1, 2008", voice: "press", hts: "2C",
          text: "Points out that Bennett’s lawyers argued Seattle would lose little if the team left, while Bennett sought about $100 million of public money in Oklahoma City.",
          limit: "Reason is a libertarian magazine that opposes sports subsidies, so it picks the facts that support that view." },
      ],
      links: [{ to: "owners", label: "Gave the owners somewhere to go." }],
    },
    {
      id: "nba", name: "NBA approval", short: "NBA vote", tiny: "NBA", weight: 8, theme: "PCE", when: "Apr 18, 2008",
      summary: "The league’s owners voted 28 to 2 to approve the move. It was the final permission, not the original push.",
      evidence: [
        { src: "kershner", when: "Jan 2009", voice: "league", hts: "3B",
          text: "A week after the final home game, the NBA board approved the move 28 to 2, with Dallas and Portland voting no.",
          limit: "Reports the vote but not the owners’ reasons." },
      ],
      links: [],
    },
  ];

  /* ---------------- TIMELINE ---------------- */
  // track: city = Seattle's political response, owners = the ownership group's strategy, both = shared event
  const EVENTS = [
    { date: "Oct 24, 2006", track: "owners", node: "owners", src: ["ap_stern", "kershner"],
      title: "NBA owners approve the sale to Clay Bennett’s group",
      text: "Bennett promises to spend a full year seeking a viable Seattle home for the team." },
    { date: "Nov 7, 2006", track: "city", node: "i91", src: ["licata", "horsefeathers"],
      title: "Seattle voters pass Initiative 91",
      text: "74% say the city must get “fair value” for any investment in a pro sports facility." },
    { date: "Feb 2007", track: "owners", node: "state", src: ["brunner07"],
      title: "Bennett turns to the state",
      text: "He asks for $300 million of King County taxes toward a roughly $500 million arena in Renton. I-91 does not reach the state." },
    { date: "Apr 16, 2007", track: "city", node: "state", src: ["ap_leg07", "kershner"],
      title: "The Legislature won’t vote",
      text: "Lawmakers say there isn’t time before April 22. Governor Gregoire declines a special session." },
    { date: "Apr 17, 2007", track: "owners", node: "owners", src: ["ap_bulletin", "ap_stern"],
      title: "The Ward–Bennett emails",
      text: "Partner Tom Ward asks about moving “here for next season.” Bennett replies, “I am a man possessed!”" },
    { date: "Aug 2007", track: "owners", node: "owners", src: ["fos"],
      title: "McClendon’s remark",
      text: "He says the group didn’t buy the team to keep it in Seattle, then walks it back." },
    { date: "Sep 2007", track: "city", node: "owners", src: ["kershner"],
      title: "Seattle sues",
      text: "The city sues to hold the team to its KeyArena lease through 2010." },
    { date: "Feb 2008", track: "owners", node: "owners", src: ["ap_settle"],
      title: "A $26.5 million lease buyout offer",
      text: "The owners offer to pay to leave the lease early. The city says no." },
    { date: "Mar 2008", track: "owners", node: "okc", src: ["brunner08"],
      title: "Oklahoma City approves $120 million",
      text: "Voters there approve taxes for an arena upgrade aimed at attracting the team." },
    { date: "Mar 2008", track: "city", node: "state", src: ["brunner08", "kershner"],
      title: "A Ballmer-backed plan stalls",
      text: "Investors offer to cover half of a $300 million KeyArena rebuild, if they can buy the team. Lawmakers are skeptical, and the session ends without approval." },
    { date: "Apr 13, 2008", track: "both", node: "attendance", src: ["kershner"],
      title: "The final home game",
      text: "About 15,000 fans fill KeyArena. The Sonics had played in Seattle for 41 years." },
    { date: "Apr 18, 2008", track: "both", node: "nba", src: ["kershner"],
      title: "NBA owners vote 28–2",
      text: "Dallas and Portland vote no. The move is approved, pending Seattle’s lawsuit." },
    { date: "Jun 2008", track: "both", node: "owners", src: ["ap_bulletin"],
      title: "Six days in federal court",
      text: "Bennett testifies on June 17 that he was reaffirming his commitment to Seattle, not answering a proposal to move." },
    { date: "Jul 2, 2008", track: "both", node: "state", src: ["ap_settle"],
      title: "The settlement",
      text: "$45 million now. Up to $30 million more only if the Legislature authorizes at least $75 million for KeyArena by the end of 2009 and Seattle gets no NBA team within five years. The name, logo and colors stay available for a replacement team." },
  ];

  /* ---------------- CHAIN (the simple story, one domino per event) ----------------
     Indexes into EVENTS. Track colors the domino: city = green, owners = gold, both = ivory. */
  const CHAIN = [0, 1, 2, 3, 4, 8, 11, 13];

  return { VOICES, THEMES, SOURCES, CAUSES, EVENTS, CHAIN };
})();
