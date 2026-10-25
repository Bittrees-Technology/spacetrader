import Foundation

@main struct JourneyClockTests {
    static func main() {
        func close(_ a:Double,_ b:Double) {precondition(abs(a-b)<1e-8,"\(a) != \(b)")}
        var clock=JourneyPlaybackClock(now:100)
        for t in stride(from:100.0,through:116.0,by:1.0/120) {close(clock.progress(at:t),(t-100)/32)}
        close(clock.progress(at:116),0.5)
        print("PASS native playback follows monotonic elapsed time independently of frame cadence")
        clock.setPaused(true,at:108);close(clock.progress(at:500),0.25)
        clock.setPaused(false,at:500);close(clock.progress(at:508),0.5)
        print("PASS native pause and resume retain exact progress without a catch-up jump")
        clock.toggleSpeed(at:508);close(clock.progress(at:510),0.75)
        clock.toggleSpeed(at:510);close(clock.progress(at:514),0.875)
        print("PASS native speed changes settle previous elapsed time before applying the new rate")
        clock.setSuspended(true,at:514);close(clock.progress(at:900),0.875)
        clock.setPaused(true,at:900);clock.setSuspended(false,at:901);close(clock.progress(at:1000),0.875)
        clock.setPaused(false,at:1000);close(clock.progress(at:1004),1);close(clock.progress(at:5000),1)
        let reduced=JourneyPlaybackClock(paused:true,now:0);close(reduced.progress(at:500),0)
        print("PASS native background suspension respects manual pause, reduced motion and completion bounds")
        close(JourneyMotion.turnover(0.48),0);close(JourneyMotion.turnover(0.5),0.5);close(JourneyMotion.turnover(0.52),1)
        var prior=0.0
        for i in 0...10000 {let u=Double(i)/10000,d=JourneyMotion.distance(u),p=JourneyMotion.point(distance:d),f=JourneyMotion.trailFraction(d);precondition(p.x.isFinite && p.y.isFinite && f.isFinite && f>=prior);prior=f}
        close(JourneyMotion.point(distance:0).x,140);close(JourneyMotion.point(distance:1).x,760);close(prior,1)
        print("PASS native turnover and cached route lengths remain smooth, finite and aligned from departure to arrival")
    }
}
