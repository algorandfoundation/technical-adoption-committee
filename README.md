# Algorand Technology Radar

This is the Algorand Technology Radar. It is intended to be a snapshot of the current state of the Algorand ecosystem, and to provide a look into the state of adoption of various technologies, standards and projects in the ecosystem.

## Radar Chart

The radar is divided into four quadrants, each representing a different level of maturity. The quadrants are:

- **Adopt**: Technologies that are considered mature and signals that they can be used in production.
- **Trial**: Trial phase, some projects maybe already be using it in production, but it is not yet considered mature.
- **Assess**: Evaluation phase, projects are experimenting with the technology
- **Hold**: Being monitored, but not yet being used in production.

## Updates

The radar is reviewed monthly by the ATC (Algorand Technical Comittee). Items in the radar are reviewed and moved to different quadrants as needed.

Items being moved from **HOLD** to other quadrants are done so by voting by the ATC's members.

The group will accept pull requests to add new items to the radar. New items will be added to the **HOLD** quadrant and will be reviewed by the ATC in the next monthly meeting.

## How to add a new item

To add a new item to the radar, please create a pull request where you add a new entry to the config.json file. The entry should be in the following format:

```json
    {
      "quadrant": 0, // 0 == Projects, 1 == Infrastructure, 2 == ARCS, 3 == Standards & Techniques
      "ring": 1, // 0 == Adopt, 1 == Trial, 2 == Assess, 3 == Hold
      "label":"Algorand Extension API provider", // Name of the item
      "link": "https://github.com/algorand/js-algorand-sdk", // Link to the item
      "active": true, // Not doing much atm
      "moved": 0 // 0 == Not moved and shows as a circle, 1 == Moved and shows as a triangle
    }
```

#### Credits

This project is based on the [Zalando Tech Radar](https://github.com/zalando/tech-radar), which in turn is inspired by [ThoughtWorks Radar](https://www.thoughtworks.com/radar).
