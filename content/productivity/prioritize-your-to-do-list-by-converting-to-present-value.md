---
title: Prioritize Your To-Do List By Converting To Present Value
description: >-
  Convert time savings to present value using 10% discount rate. Your commute is
  worth $8k today, which helps decide if moving beats Netflix.
authors: []
date: 2019-04-13T00:02:11.000Z
metadata:
  categories:
    - Productivity
  uuid: '11ty/import::wordpress::https://thinkbynumbers.org/?p=9546'
  type: wordpress
  url: >-
    https://thinkbynumbers.org/productivity/prioritize-your-to-do-list-by-converting-to-present-value/
  media:
    featuredImage: >-
      /assets/og-images/productivity/prioritize-your-to-do-list-by-converting-to-present-value.jpg
    ogImage: >-
      /assets/og-images/productivity/prioritize-your-to-do-list-by-converting-to-present-value.jpg
    infographic: >-
      /assets/infographics/productivity/prioritize-your-to-do-list-by-converting-to-present-value.jpg
    thumbnail: >-
      /assets/thumbnails/productivity/prioritize-your-to-do-list-by-converting-to-present-value.jpg
tags:
  - productivity
aiScores:
  quality: 9
  value: 9
  timeliness: 10
  reasoning: >-
    This content provides a rigorous mathematical framework for the 'Time is
    Money' cliché, converting abstract opportunity costs into concrete financial
    data. By using a 10% discount rate (the opportunity cost of capital), it
    exposes the massive 'hidden tax' of long commutes and inefficient housing
    choices. This empowers the median individual to make life-altering
    decisions—like moving or changing jobs—based on NPV (Net Present Value)
    rather than emotional inertia, directly combating the wealth and happiness
    extraction inherent in modern urban sprawl.
  scoredAt: '2025-12-31T06:06:21.119Z'
  model: gemini-3-flash-preview
  length: 4487
  imageCount: 0
---
There are infinite ways to spend your most valuable resource: time. How do you decide the most cost-effective way to spend it? Convert the returns of each activity to its present value and pick the activity with the highest present value.

I live in a house that's bigger than I need and farther from my job than I'd like. I'd like to sell it and get a smaller apartment closer to work.

## Costs and Benefits of Moving

### 1. Time Savings

Moving takes time. To do apples-to-apples comparisons, convert this time to monetary value. According to the Bureau of Labor Statistics, the average American worker makes [$27/hour](https://www.bls.gov/news.release/empsit.t19.htm).

Moving closer to my job saves me 2 hours per week (equivalent to $54 in weekly earnings). I assume I'll work there for 4 more years. This gives us total savings of $11,232 (52 weeks × $54/week × 4 years).

However, due to inflation and interest-earning potential, a dollar today is worth more than a dollar tomorrow. To achieve apples-to-apples comparison, convert these savings to equivalent Present Value.

Calculate the equivalent present value using Google Sheets:

`Present Value = future_value/(1 + rate)^number_of_periods`

or in Google Sheets:

`PV(rate, number_of_periods, future_value)`

-   `rate` – The rate you could get by investing this money. [10%](https://www.nerdwallet.com/blog/investing/average-stock-market-return/) is the average annual return for the stock market.
-   `number_of_periods` – We're using annual return and I'll save this drive for 4 years. Number of periods is 4.
-   `future_value` – We'll save $11k (52 weeks × $54/week × 4 years).

The result is a Present Value of $8k for the time savings from not driving so much.

### 2. Rent Savings

Say my monthly mortgage payment is $1,400/month. I can get a smaller apartment for $900/month. I'll save $500 per month on rent. After 4 years, that saves me $24k. Plugging those numbers into our PV formula gives us $15k.

### 2. Selling & Moving Expenses

Moving comes with cost. Assuming a sale price of $200,000, the typical costs of selling a house and moving are $33,330.

<iframe loading="lazy" class="airtable-embed" style="background: transparent; border: 1px solid #ccc;" src="https://airtable.com/embed/shrKWs8DhDmaQi6zn?backgroundColor=yellow&amp;viewControls=on" width="100%" height="533" frameborder="0"></iframe>

Also, assume you have $116k remaining on the principal of your mortgage. That brings our total proceeds down to $50k.

So far, our total PV from moving is $58k ($8 plus $50k).

### 3. Opportunity Cost of Future Sale

We need to consider the opportunity cost to sell our house in 20 years once the mortgage is paid off. The U.S. House Price Index shows prices have risen at 3.4% per year on average since 1991.

To calculate expected future value based on your growth rate, add one to the rate and raise this to a power equal to the number of years you're looking at.

`future_value = (1 + annual_growth_rate) ^ years * current_value`

or

`(1 + 0.0034) ^ 20 years * $200k = $390k Future Value`

In 20 years, our home should be worth $390k. Let's convert that back to Present Value for apples-to-apples comparison.

`Present Value = $390k/(1 + 0.1)^(20 years) = $58k`

## Net Present Value

Net Present Value is what helps us make our final decision. It is the present value of benefits minus the present value of costs.

In our case, the Net Present Value is:
`$7k + $18k - $58k - $33k + $200k - $116k = $18k`

Since $18k is positive, it's time to move.

<iframe loading="lazy" class="airtable-embed" style="background: transparent; border: 1px solid #ccc;" src="https://airtable.com/embed/shrmprxcBBETN5l1v?backgroundColor=yellow&amp;viewControls=on" width="100%" height="533" frameborder="0"></iframe>

### Future Value

Let's calculate how much better off we'll be in 20 years if we sell. We can invest this $18k in an index fund getting us 10% return a year. In 20 years, this $18k will be worth $121k.

## Opportunity Cost

However, let's say I have a startup business I could work on in the time I spend moving. Let's calculate how much time moving takes.

It takes about 40 hours to pack everything and another 40 hours to unpack and move. We often underestimate, so let's double that to 160 hours. The median hourly rate is $27/hour. That's a current time cost of $4,320, bringing our total Present Value down to $14k.
