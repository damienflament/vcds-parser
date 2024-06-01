// Date and time rules

Datetime
  = DayName ',' Day ',' MonthName ',' Year ',' Hours ':' Minutes ':' Seconds ':00009'
  { return new Date(text()) }

Duration
  = minutes:$Minutes ':' seconds:$Seconds
  { return { minutes: integer(minutes), seconds: integer(seconds) } }

DayName 'the name of a week day'
  = 'Monday'
  / 'Tuesday'
  / 'Wednesday'
  / 'Thursday'
  / 'Friday'
  / 'Saturday'
  / 'Sunday'

Day 'a day number'
  = $('0'[1-9] / [12][0-9] / '3'[01])

Month 'a month number'
  = $('0'[1-9] / '1'[0-2])

MonthName 'the name of a month'
  = 'January'
  / 'February'
  / 'March'
  / 'April'
  / 'May'
  / 'June'
  / 'July'
  / 'August'
  / 'September'
  / 'October'
  / 'November'
  / 'December'

Year 'a year'
  = $([12][0-9]|3|)

Hours 'hours'
  = $([01][0-9] / '2'[0-3])

Minutes 'minutes'
  = $([0-5][0-9])

Seconds 'seconds'
  = $([0-5][0-9])
