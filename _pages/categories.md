---
title: ToDo
layout: page
permalink: /categories/
---
{% for category in site.categories %}
# {{ category[0] }}
  {% for post in category[1] %}
    - [{{ post.title }}]({{ post.url }})
  {% endfor %}
{% endfor %}
<!-- {% for category in site.categories %} -->
<!--   <h3>{{ category[0] }}</h3> -->
<!--   <ul> -->
<!--     {% for post in category[1] %} -->
<!--       <li><a href="{{ post.url }}">{{ post.title }}</a></li> -->
<!--     {% endfor %} -->
<!--   </ul> -->
<!-- {% endfor %} -->
