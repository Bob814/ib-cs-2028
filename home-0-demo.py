import math
v = float(input("State the initial speed [ms^-1]: "))
angle = float(input("State the launch angle [degrees]: "))
h = float(input("State the initial height [m]: "))
dt = float(input("State the time interval between calculations [s]: "))
g = 9.81

# What I've decided to do is calculate each ds for every dt, so every time dt passes, ill update the
# velocity and estimate the distance traveled in this time dt, then ill add this to the initial height value
# the process will end when velocity is less than or equal to 0, once it is equal to zero, the new value will be
# the max height (MH), if its less than 0, then the previous value will be named MH (this is for the y value of course)
angle_rad = math.radians(angle)
vx = v * math.cos(angle_rad)
vy = v * math.sin(angle_rad)
x = 0.0
y = h
time = 0.0
MH = h
print("the initial coordinates are: (" + str(0) + ";" + str(h) + ")")
while vy > 0:
    prev_y = y
    vy_next = vy - g*dt
    ds = ((vy + vy_next) / 2)*dt

    y = y + ds
    x = x + vx*dt
    time = time + dt
    vy = vy_next
    if vy == 0:
        MH = y
    elif vy < 0:
        MH = prev_y


print("Max height: " + str(MH))
print("Time taken: " + str(time))
print("Horizontal distance: " + str(x))
