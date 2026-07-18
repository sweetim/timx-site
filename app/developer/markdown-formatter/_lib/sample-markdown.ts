export const SAMPLE_MARKDOWN = `#  Markdown Formatter



Paste **messy** markdown and click _Format_ to clean it up.  



##  Why?



* Tables get aligned with nice padding
+ List markers are normalized
-  Blank lines and trailing whitespace collapse



|Feature|Status|Notes|
|---|---|---|
|Table padding|done|columns auto-sized|
|GFM support|yes|tables, strikethrough, task lists|
|Alignment|yes|\`:---:\` and \`---:\` honoured|



###  Alignment demo

|Left|Center|Right|
|:---|:---:|---:|
|a|b|c|
|longer|longest|tiny|



\`\`\`js
function greet(name){return 'hi '+name}
\`\`\`

> Quote blocks and ~~strikethrough~~ are preserved too.



- [x] Format tables
- [ ] Ship it

---
`
