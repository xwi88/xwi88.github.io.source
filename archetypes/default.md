---
url: "{{ trim .Name " " | lower }}"{{/*the content’s url (or title if no url), replace slug*/}}
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
---
