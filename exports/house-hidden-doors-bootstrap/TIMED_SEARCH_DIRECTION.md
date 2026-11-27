# Timed hidden-object direction — 2026-11-27

Owner direction: make Bobby's House of Hidden Doors a timed seek-and-find mystery, informed by Hidden City, June's Journey, Criminal Case, Seekers Notes and scavenger-hunt games. Preserve existing campaign, tagline, canon, original artwork and save schema. Do not use third-party game art or copy levels.

This first isolated library practice scene implements six target objects, twelve distractors, a monotonic 90-second deadline, three-second wrong-click penalty, two time-costed hints and derived completion score. Original hand-authored vector scene; not final cinematic artwork. Accessible object names support keyboard and assistive navigation; competitive leaderboards are out of scope. No campaign rewards or persistence are claimed.

Next: approved high-detail scenes, responsive touch/zoom hit-testing, multiple room-specific target sets, clue journal and verified campaign unlock integration, accessible untimed option, end-to-end browser and device tests. Keep existing Attic PR #30 separate.

P0 packaging: desktop_suite/app_meta.json currently bundles client/dist (Warp Zones device/compliance UI). Do not ship it as Hidden Doors. The entertainment export is the intended game source. A separate package correction must bind to that export and exclude hardware/clipboard APIs. No installed build or store qualification claimed.
