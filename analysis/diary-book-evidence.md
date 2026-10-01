# Diary book extraction and ordering

The book preserves source screenshot artwork, not OCR-generated prose. Page ordinal is the order in the supplied montage, not a day number or a count of distinct dates. Some original pages combine several days; original dates remain inside the artwork.

`extract_diary_pages.py` produced a header OCR audit. Its tentative grouping was rejected for publication: compression changed OCR output on the same image, and a common header sometimes merged images with changed lower-page content. OCR text is kept in `diary-extraction.json` and is not shown as verified transcription.

Final publication uses `measure_diary_changes.py` and `build_diary_manifest.py`. For consecutive source slots, the difference is

`D(a,b) = mean(|area_resize_1/10(a) - area_resize_1/10(b)|)`

over BGR channels, in 8-bit channel-value units. Resizing reduces codec block noise; this is an image-content comparison, not physical distance or movement estimation. Each slot is five 30fps container frames apart, corresponding to the supplied 6fps montage; the middle frame is retained. Sampling provenance is recorded; this does not claim every 30fps compression variant is a separate diary.

The source-specific duplicate tolerance is the **maximum measured D** of visually reviewed same-image pairs ending at frames 17, 77, 2657 and 2777. It is computed from `diary-distances.json`, not typed as a threshold. Values above this bound are retained, even when they may be motion inside one diary image. A narrow rule deliberately avoids relying on OCR day labels to remove different artwork. This is not calibrated or validated for other videos.

Boundary pairs ending at 1482, 1487, 1942, 2417 and 2422 also look close, but have greater differences; they remain separate. See `duplicate-boundaries.jpg`. Selection and per-page source-frame/time provenance are in `diary-page-selection.json`. No synthetic day labels, missing-day reconstruction, chronological reordering, speed estimates or experiment accuracy claims were added.

Book spread mapping: spread `s` has logical pages `2s` and `2s+1`; logical page 0 is the introductory preface, page `p >= 1` uses original entry index `p-1`. An unused final right page becomes an epilogue. The slider selects spread ordinal. Inputs received during an animation update the desired spread and are coalesced; the next turn lands on the latest requested spread.

Animation timing and perspective are art-direction parameters with explicit units, not estimates of physical paper dynamics.
