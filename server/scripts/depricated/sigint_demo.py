import signal
import os 
import time
import sys

def handler(signum, frame):
    signame = signal.Signals(signum).name
    time.sleep(1)
    print(f"Signal Handler called with signal {signame} ({signum})")
    time.sleep(1)
    exit()
    # raise OSError("Couldn't open device or sumshit")

signal.signal(signal.SIGTERM, handler)
# signal.alarm(5)
a = True
# time.sleep(10)
while(a):
    print("a",end=" ", flush=True)
    time.sleep(1)
a = False
exit()

# def off():
#     print("hello there")


# try: 
#     while True:
#         # print("b" , end=" ", flush=True)
#         sys.stdout.write("b ")
#         sys.stdout.flush()
#         time.sleep(1)
# except KeyboardInterrupt:
#     print("you pressed CTRL+C!!!", flush=True)
#     sys.stdout.write("b ")
#     sys.stdout.flush()
#     time.sleep(1)
# finally:
#     print("do all this finally stuff1", flush=True)
#     print("do all this finally stuff2", flush=True)
#     print("do all this finally stuff3", flush=True)
#     print("do all this finally stuff4", flush=True)
#     off()
#     sys.stdout.write("do all this finally stuff5\n")
#     sys.exit("hello")

# print("Done.", flush=True)