import math

v1 = float(
    input("Enter velocity of your vehicle [ms^-1] (relative to the ground): "))
v2 = float(
    input("Enter velocity of anomaly [ms^-1] (relative to the ground): "))
d = float(
    input("Enter the distance between your vehicle and the anomaly [m]: "))
dt = float(input("Set the time between each measurement (s): "))

# latency equals 0.1
# mu is the road friction coefficient and equals 0.7 (its an average)
# Danger_Distance = a
# max deceloration allowed before danger is 6 ms^-2
Deceleration = 6

db = (v1**2)/(2*0.7*9.8)
denom = (2*d - 2*v1*0.1 - 2*db)
a = v1*v1 / denom

if v2 > v1:
    print("You will never collide with the anomaly")

else:
    while v1 > v2 and d > 0:

        if a > Deceleration:
            bt = (v1-v2)/Deceleration
            print("emergency breaks will be activated for: " + str(bt) + " seconds")
            v1 = v1 - 6*bt
            print("new velocity: " + str(v1))

        else:
            t = (d - db) / (v1 - v2)
            if 0 > t:
                t = (v1 - v2) / 6
                print("emergency breaks will be activated for: " +
                      str(t) + " seconds")
                v1 = v1 - 6 * t
                print("new velocity: " + str(v1))
            else:
                print("In time " + str(t) + " you will be dangerously close!")
                break

    print("You are at a safe distance from the anomaly")
