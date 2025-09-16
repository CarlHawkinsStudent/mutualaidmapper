export const locationData = {
  "CA": {
    "Los Angeles": ["Downtown", "Hollywood", "Beverly Hills", "Santa Monica", "Venice", "Pasadena", "Long Beach"],
    "San Francisco": ["Mission", "Castro", "Chinatown", "SOMA", "Richmond", "Sunset", "Marina"],
    "San Diego": ["Downtown", "Gaslamp", "Balboa Park", "La Jolla", "Pacific Beach", "Hillcrest"],
    "Sacramento": ["Downtown", "Midtown", "East Sacramento", "Land Park", "Natomas"],
    "Oakland": ["Downtown", "Temescal", "Rockridge", "Fruitvale", "West Oakland"]
  },
  "NY": {
    "New York City": ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"],
    "Buffalo": ["Downtown", "Elmwood Village", "Allentown", "North Buffalo"],
    "Rochester": ["Downtown", "Park Avenue", "South Wedge", "Neighborhood of the Arts"],
    "Syracuse": ["Downtown", "University Hill", "Westcott", "Tipperary Hill"],
    "Albany": ["Downtown", "Center Square", "Pine Hills", "Delaware Avenue"]
  },
  "TX": {
    "Houston": ["Downtown", "Montrose", "Heights", "Midtown", "River Oaks", "Galleria"],
    "Dallas": ["Downtown", "Deep Ellum", "Bishop Arts", "Uptown", "Oak Cliff"],
    "Austin": ["Downtown", "South Austin", "East Austin", "West Lake Hills", "Cedar Park"],
    "San Antonio": ["Downtown", "Southtown", "Pearl", "Alamo Heights", "Stone Oak"],
    "Fort Worth": ["Downtown", "Cultural District", "Near Southside", "West 7th"]
  },
  "FL": {
    "Miami": ["Downtown", "South Beach", "Wynwood", "Little Havana", "Coral Gables"],
    "Orlando": ["Downtown", "Winter Park", "College Park", "Thornton Park"],
    "Tampa": ["Downtown", "Ybor City", "Hyde Park", "Westshore"],
    "Jacksonville": ["Downtown", "Riverside", "San Marco", "Atlantic Beach"],
    "St. Petersburg": ["Downtown", "Grand Central", "Old Northeast", "Kenwood"]
  },
  "IL": {
    "Chicago": ["Loop", "Lincoln Park", "Wicker Park", "Logan Square", "Hyde Park", "River North"],
    "Aurora": ["Downtown", "Near East Side", "West Aurora", "Far East Side"],
    "Rockford": ["Downtown", "Midtown", "Southwest", "Northeast"],
    "Joliet": ["Downtown", "Cathedral Area", "Pilcher Park", "West Side"],
    "Naperville": ["Downtown", "Hobson West", "Ashwood Park", "White Eagle"]
  },
  "PA": {
    "Philadelphia": ["Center City", "Northern Liberties", "Fishtown", "South Philly", "University City"],
    "Pittsburgh": ["Downtown", "Lawrenceville", "Shadyside", "Squirrel Hill", "Strip District"],
    "Allentown": ["Downtown", "West End", "East Side", "South Side"],
    "Erie": ["Downtown", "East Erie", "West Erie", "Millcreek"],
    "Reading": ["Downtown", "Mount Penn", "West Reading", "Wyomissing"]
  },
  "OH": {
    "Columbus": ["Downtown", "Short North", "German Village", "Clintonville", "Grandview"],
    "Cleveland": ["Downtown", "Ohio City", "Tremont", "University Circle", "Lakewood"],
    "Cincinnati": ["Downtown", "Over-the-Rhine", "Mount Adams", "Clifton", "Hyde Park"],
    "Toledo": ["Downtown", "Old West End", "Warehouse District", "Ottawa Hills"],
    "Akron": ["Downtown", "Highland Square", "Wallhaven", "Firestone Park"]
  },
  "GA": {
    "Atlanta": ["Downtown", "Midtown", "Buckhead", "Virginia-Highland", "Little Five Points"],
    "Augusta": ["Downtown", "Summerville", "Hill Acres", "Forest Hills"],
    "Columbus": ["Downtown", "Midtown", "Green Island Hills", "Lakebottom"],
    "Savannah": ["Historic District", "Victorian District", "Midtown", "Southside"],
    "Athens": ["Downtown", "Five Points", "Normaltown", "Boulevard"]
  },
  "NC": {
    "Charlotte": ["Uptown", "NoDa", "South End", "Dilworth", "Myers Park"],
    "Raleigh": ["Downtown", "Glenwood South", "Cameron Village", "North Hills"],
    "Greensboro": ["Downtown", "Fisher Park", "Irving Park", "Sunset Hills"],
    "Durham": ["Downtown", "Ninth Street", "Trinity Park", "Hope Valley"],
    "Winston-Salem": ["Downtown", "West End", "Ardmore", "Buena Vista"]
  },
  "MI": {
    "Detroit": ["Downtown", "Midtown", "Corktown", "Eastern Market", "Rivertown"],
    "Grand Rapids": ["Downtown", "Heritage Hill", "Eastown", "Creston"],
    "Warren": ["Downtown", "East Warren", "West Warren", "Sterling Heights"],
    "Sterling Heights": ["Downtown", "Utica", "Clinton Township", "Shelby Township"],
    "Lansing": ["Downtown", "Old Town", "REO Town", "Eastside"]
  },
  "NJ": {
    "Newark": ["Downtown", "Ironbound", "North Ward", "Central Ward"],
    "Jersey City": ["Downtown", "Newport", "The Heights", "Greenville"],
    "Paterson": ["Downtown", "Eastside", "Southside", "Northside"],
    "Elizabeth": ["Downtown", "Elmora", "Midtown", "Peterstown"],
    "Edison": ["Downtown", "Menlo Park", "Oak Tree", "Clara Barton"]
  }
};

export const getStates = () => Object.keys(locationData);
export const getCities = (state) => state ? Object.keys(locationData[state] || {}) : [];
export const getNeighborhoods = (state, city) => state && city ? locationData[state]?.[city] || [] : [];