---
title: From Design to Development with Figma and tailwindcss
date: 2024-10-06
---

Developing user facing software without a designer often leads to products that simply do not look good. But very few developer resources or tutorials focus on the relationship between a designer and a developer. This article is for all the developers who are working together with a designer and want to implement a design with tailwindcss.

## The problem

I have been reading and watching a lot of tutorials or opinion pieces on how to create applications using technologies like [tailwindcss](https://tailwindcss.com/) or the [shadcn/ui](https://ui.shadcn.com/) library. And while I thoroughly enjoy this content and it is a great way to learn, I have found that in 1 certain aspect these resources are lacking. And this aspect is the implementation of an existing design and how that fits into the development process.

### Tooling

When you work with a designer, a lot of tools that are marketed to developers are less useful. For example, it is hard to re-create a design in Figma with [v0](https://v0.dev/) (although it is still a perfect tool to use to get the logic/functionality of a component correct). Another example is the use of a component library like [MUI](https://mui.com/), using this library in a project will not give you the same look and feel as the design, and it will also not be as easy to implement the design as it would be if you were to implement it yourself. As we will see, tailwindcss solves this problem, as it allows full customization of every aspect of the design, while at the same time allowing you to restrict the possible styles to only the ones that are used in the design.

## The solution

### Communicate

The first step is to communicate with the designer. Having a common approach to the design that you both understand is essential. For example, maybe your designer has a specific color palette or font size set that they use in their design, but they have not stored those in the local styles or variables. In this case it would be good to ask the designer if they can provide these styles, so that you can use them while developing the project.

Another example is that maybe your designer has designed a specific component in a way that is impractical to implement in your project, while it would be possible to implement such a component, it would for example impact the performance of the application or it would simply take too much time to implement. In such a case, you should ask the designer if there is a possibility they can provide a different approach to the component that would be more suitable for your project. Often times, the designer simply did not know this component is much more complex than it looks in the design, and they will happily change the design. If they are unwilling, it is usually for a good reason, and it might be worth the extra effort implementing the component.

### Use tailwind.config

When you use tailwindcss, you have probably heard of the tailwind.config file. You probably have extended the default theme with your own colors and fonts. But in my opinion the true power of tailwind.config is not extending the default theme, but instead using it to completely overwrite the default theme for most of the classes, in my experience, when working with a figma design, I overwrite at least the colors, font sizes, font families and sometimes also the border radius values. Usually I do like to keep the default spacing values and screens, but might extend them if the design calls for it.

By not extending the default theme but instead overwriting it, I can make sure that the classes that I use in my project are always the same as the ones that are used in the design. Furthermore, I can be sure that any team member that is working on the project will always have the same classes and values as the ones that are used in the design. Overwriting the default theme works very well with any tailwindcss editor extension like the one in VScode where you can see the classes that are being used in your project, so there is not much of a learning curve for new projects, even though you might not be able to use the default classes, you can simple start writing `bg-` and it will give you the list of all available background colors. Usually this list is also shorter because you only allow the colors that are used in the design.

### Headless UI

In my experience, headless component libraries like [Radix Primitives](https://www.radix-ui.com/primitives) are a great help for developers having to implement a design. You can still use the functionality and accessibility of these components, but you don't have to worry about the styling. Even `shadcn/ui` can be a great help, as you are free to adjust any styling you want, but can still keep the default animations or other aspects of the design that are either the same or not specified in the design file.
