# Terminal chrome and function-search reference

Reviewed the user-supplied *Getting Started Guide for Students (English)*: all 28 PDF pages and all 31 embedded images, including keyboard/login, panels, autocomplete, menus, analysis, Excel and help examples. The terminal panel/search/analysis images govern the web UI; the Excel ribbon and unsupported Bloomberg functions are not added to this product. PDF images/assets are not distributed in this repository.

| PDF pages | Applied visual convention |
| --- | --- |
| 7–8, 13, 15–17, 21 | Dark navy reading surface, compact red function bars, thin slate/light-gray boundaries, gray square window controls |
| 9–12, 14 | One persistent command/search field, slate result overlay, amber codes, white descriptions, blue selected row |
| 15–17, 23 | Amber editable fields with dark text, compact aligned tables, quiet provenance and unavailable-state text |

Shared tokens: background/panel #00151e; chrome #243740; function bar #a91c2c; editable field/accent #ffad27; selected row #155b94. Bergoom remains the licensed open-source substitute. Domestic HTS red/blue price movement, immutable source OHLCV and honest unavailable data remain unchanged.

## Interaction contract

- SCREENS toggles the full directory. Typing filters; it never opens a pane. Number, command, alias/legacy number, title and workspace name are searchable. Exact matches sort first.
- Enter/GO executes a command or selected suggestion once. Explicit result clicks/arrow selection take precedence over a matching raw command. Escape/Tab/outside focus dismiss; IME composition Enter and held Enter do not execute. Unknown input retains a visible error. HELP opens this same directory; REFRESH remains a read.
- One instance per function per desk. Repeated GP reuses/raises its chart. Legacy persisted duplicates are consolidated by type, preserving the first pane's geometry. Changing an explicit symbol/source refreshes that pane.
- Opening/closing/maximizing another function does not remount surviving panels/charts. Existing manual placement is retained. Account publication changes still refresh application data through its existing lifecycle. The persistent search field/results survive that refresh.
- No additional file/export/layout-management controls, copied proprietary assets, trading logic or new data providers are introduced. Removed duplicate header shortcuts, HELP directory/dialog, hidden headings/layout placeholder, repeated-window flags, obsolete reset/minimize logic, unused widget action/state and retired toolbar CSS.
