import Foundation

@main struct SimulationTests {
    static var checks = 0
    static func expect(_ condition: @autoclosure () -> Bool, _ message: String) {
        checks += 1
        if !condition() { fatalError("FAIL: \(message)") }
    }
    static func rejects(_ message: String, _ action: () throws -> Void) {
        checks += 1
        do { try action(); fatalError("FAIL: expected rejection: \(message)") } catch { }
    }
    static func canonical(_ state: Simulation) -> Data {
        var object = try! JSONSerialization.jsonObject(with: JSONEncoder().encode(state)) as! [String: Any]
        // Sets have no iteration order; compare their contents rather than their encoded array order.
        object["visited"] = state.visited.sorted()
        object["completed"] = state.completed.sorted()
        return try! JSONSerialization.data(withJSONObject: object, options: .sortedKeys)
    }
    static func main() throws {
        let earth = World.port("earth"), mars = World.port("mars")
        let transfer = Transfer.between(earth, mars, day: 0)
        expect((258...260).contains(transfer.coastDays), "Earth–Mars Hohmann time matches JPL’s approximately 259 days")
        expect(transfer.waitDays <= 1, "Illustrative initial phase opens the first Earth–Mars window")
        expect((995...1000).contains(Transfer.between(earth, World.port("callisto"), day: 0).coastDays), "Earth–Jupiter transfer is about 997 days")
        expect(Transfer.between(earth, World.port("moon"), day: 0).coastDays == 5, "Cislunar transfer uses the documented five-day model")
        expect(Transfer.between(mars, earth, day: 120).coastDays == transfer.coastDays, "Hohmann travel time is symmetric")
        for day in stride(from: 0, to: 2500, by: 113) {
            let t = Transfer.between(earth, mars, day: day)
            expect(t.waitDays >= 0 && t.waitDays <= 781, "Mars wait stays within a synodic cycle")
        }
        var s = Simulation()
        let light = s.quote(to: "moon"); s.cargo["water"] = 32; let heavy = s.quote(to: "moon")
        expect(heavy.minimumFuel > light.minimumFuel, "Cargo mass increases required propellant")
        s.fuel = heavy.minimumFuel
        let boundary = s.quote(to: "moon")
        expect(abs(boundary.burn - boundary.minimumFuel) < 0.000001, "Rocket equation reaches zero fuel at the minimum load")
        expect(s.launchProblem(to: "moon") == nil, "Minimum feasible fuel is accepted")
        s.fuel -= 0.01
        expect(s.launchProblem(to: "moon") != nil, "Insufficient propellant is rejected")

        s = Simulation(); let before = canonical(s)
        rejects("negative purchase") { try s.buy("water", units: -1) }
        expect(canonical(s) == before, "Rejected purchase leaves simulation unchanged")
        rejects("unknown commodity") { try s.buy("unobtainium", units: 1) }
        rejects("cargo overflow") { try s.buy("water", units: 33) }
        rejects("selling unowned cargo") { try s.sell("water", units: 1) }
        rejects("overfilling fuel") { try s.refuel(to: 23) }
        rejects("nonfinite fuel") { try s.refuel(to: .nan) }
        rejects("negative loan") { try s.borrow(-1) }
        rejects("same-station travel") { try s.depart(to: "earth") }

        for ship in Ship.all {
            for good in Commodity.all {
                var market = Simulation(); market.shipID = ship.id; market.credits = 1_000_000
                let cash = market.credits
                try market.buy(good.id, units: ship.capacity); try market.sell(good.id, units: ship.capacity)
                expect(market.credits < cash, "A round-trip \(ship.name) order in \(good.id) cannot manufacture money from its own price impact")
                expect(market.quantity(good.id) == 0, "Cargo conserved after a full purchase/sale cycle")
            }
        }

        s = Simulation(); let offer = s.offers().first!
        expect(offer.destination == "moon", "Starter delivery is cislunar")
        try s.accept(offer); try s.buy(offer.good, units: offer.quantity)
        let departure = s.quote(to: offer.destination); let fuelBefore = s.fuel
        try s.depart(to: offer.destination)
        expect(abs(s.fuel - (fuelBefore - departure.burn)) < 0.000001, "Travel expends the quoted propellant")
        if s.incident != nil { try s.resolveIncident(useSpare: true) }
        expect(s.location == offer.destination && s.visited.contains(offer.destination), "Voyage arrives at the intended destination")
        let cashBeforeDelivery = s.credits; try s.deliver()
        expect(s.credits == cashBeforeDelivery + offer.reward, "Delivery pays the fixed agreed amount")
        expect(s.quantity(offer.good) == 0 && s.contract == nil, "Delivery consumes requested cargo and closes contract")
        rejects("duplicate delivery") { try s.deliver() }
        try s.validate()

        var fault = Simulation()
        fault.incident = .init(id: "test", destination: "moon", title: "Test", detail: "", damage: 18, delay: 4)
        fault.spares = 0; let faultBefore = canonical(fault)
        rejects("using absent spare") { try fault.resolveIncident(useSpare: true) }
        expect(canonical(fault) == faultBefore, "Unavailable incident option is transactional")
        rejects("trade while in transit") { try fault.buy("water", units: 1) }
        try fault.resolveIncident(useSpare: false)
        expect(fault.location == "moon" && fault.incident == nil && fault.hull == 82 && fault.day == 4, "Isolation option arrives with specified delay and damage")
        try fault.validate()

        var expired = Simulation(); try expired.accept(expired.offers().first!)
        expired.advance(1000)
        expect(expired.contract == nil, "Overdue contracts expire as time advances")
        expect(expired.debt > 4000 && expired.debt < 5000, "Annual interest is bounded over long flights")
        try expired.validate()

        let data = try JSONEncoder().encode(s); var restored = try JSONDecoder().decode(Simulation.self, from: data)
        try restored.validate()
        expect(canonical(restored) == canonical(s), "Save round trip preserves the complete simulation")
        expect(restored.random() == s.random(), "Save round trip preserves deterministic future incidents")
        var invalid = Simulation(); invalid.shipID = "missing"
        rejects("unknown saved ship") { try invalid.validate() }
        invalid = Simulation(); invalid.location = "missing"
        rejects("unknown saved station") { try invalid.validate() }
        invalid = Simulation(); invalid.cargo["water"] = 200
        rejects("over-capacity save") { try invalid.validate() }
        invalid = Simulation(); invalid.fuel = .infinity
        rejects("nonfinite saved mass") { try invalid.validate() }

        for from in World.ports {
            for to in World.ports where from.id != to.id {
                let q = Transfer.between(from, to, day: 500)
                expect(q.deltaV.isFinite && q.deltaV > 0 && q.coastDays > 0 && q.waitDays >= 0, "Every supported route has a finite physical estimate")
            }
        }
        var upgraded = Simulation(); upgraded.credits = 200000; upgraded.cargo["medicine"] = 8
        let cargoBefore = upgraded.cargo; let propellantBefore = upgraded.fuel
        try upgraded.upgrade(to: "peregrine"); try upgraded.validate()
        expect(upgraded.cargo == cargoBefore && upgraded.fuel == propellantBefore, "Ship upgrade preserves existing cargo and fuel")
        print("PASS: \(checks) checks — orbital estimates, launch windows, rocket equation, trading, deliveries, incidents, loans, save validation and ship upgrades.")
    }
}
