Dashup Module Dashboard
&middot;
[![Latest Github release](https://img.shields.io/github/release/dashup/module-dashboard.svg)](https://github.com/dashup/module-dashboard/releases/latest)
=====

A connect interface for dashboard on [dashup](https://dashup.io).

## Contents
* [Get Started](#get-started)
* [Connect interface](#connect)

## Get Started

This dashboard connector adds dashboards functionality to Dashup dashboards:

```json
{
  "url" : "https://dashup.io",
  "key" : "[dashup module key here]"
}
```

To start the connection to dashup:

`npm run start`

## Deployment

1. `docker build -t dashup/module-dashboard .`
2. `docker run -d -v /path/to/.dashup.json:/usr/src/module/.dashup.json dashup/module-dashboard`