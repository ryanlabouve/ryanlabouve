---
title: "TodoMVC with Ember2"
draft: true
collection: "posts"
date: "2015-10-28"
link: todomvc-with-ember2
peak: "When you don't want to click next use infiniscroll to load in data smootly2"
---



> WIP! Please send me feedback on this! It's still in active development

![Planning TodoMVC](../posts/2015-10-16-todomvc-ember/TodoMVC-Planning.jpg)

> TodoMVC, despite its small size, contains most of the behaviors typical in modern single page applications. Before continuing, take a moment to understand how TodoMVC works from the user's perspective.

1. It displays a list of todos for a user to see. This list will grow and shrink as the user adds and removes todos.

1. It accepts text in an `<input>` for entry of new todos. Hitting the <enter> key creates the new item and displays it in the list below.

1. It provides a checkbox to toggle between complete and incomplete states for each todo. New todos start as incomplete.

1. It displays the number of incomplete todos and keeps this count updated as new todos are added and existing todos are completed.

1. It provides links for the user to navigate between lists showing all, incomplete, and completed todos.

1. It provides a button to remove all completed todos and informs the user of the number of completed todos. This button will not be visible if there are no completed todos.

1. It provides a button to remove a single specific todo. This button displays as a user hovers over a todo and takes the form of a red X.

1. It provides a checkbox to toggle all existing todos between complete and incomplete states. Further, when all todos are completed this checkbox becomes checked without user interaction.

1. It allows a user to double click to show a textfield for editing a single todo. Hitting the <enter> key or moving focus outside of this textfield will persist the changed text.

1. It retains a user's todos between application loads by using the browser's localstorage mechanism.

You can interact with a completed version of the application by visiting the TodoMVC site.

<hr>

## 00. Pep Talk

### We'll be using Ember-CLI

This is fairly Ember standard.

### We'll be testing.

Each section will start with an acceptance test, and will end with it passing

### We'll use localhost storage instead of Firebase or Rails (my usu gotos)

I want the lowest common denominator, so there aren't any uncessecarry barriers to potentials readers.

### We'll do our best to use Ember 2.0 Idioms and Constructs

* Components and Services, Controllers (except for query params)

* We'll make a point to CRUD

* Data Down, Actions Up


## 0. Getting Started

* Kickoff Project
* Copy Pasta Markup
* Copy Pasta Styles

## 1. Display a list of todos


ember sherpa's git trick

