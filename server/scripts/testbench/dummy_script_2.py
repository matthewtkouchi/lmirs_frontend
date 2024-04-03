import sys
import json
import time
from threading import Thread, Event
import pprint as pp

def pretty_print_array(p_arr_size, p_configuration):
    for i in range(p_arr_size*p_arr_size):
        state = p_configuration[f"cell_{i}"]["state"]
        negVoltage = p_configuration[f"cell_{i}"]["negVoltage"]
        posVoltage = p_configuration[f"cell_{i}"]["posVoltage"]
        dutyCycle = p_configuration[f"cell_{i}"]["dutyCycle"]
        frequency = p_configuration[f"cell_{i}"]["frequency"]
        
        if (en := p_configuration[f"cell_{i}"]["state"]) != "0":
            print(f"actuated cell [{en}] {i}", end="")


def process_input_as_json(json_input):
    """this does that thing."""

    data = json.loads(json_input)
    return (data['timestamp'],
            int(data['arrayDimension']),
            int(data['bitness']),
            data['configuration'])

def actuate_cells(p_arr_size, p_configuration, p_stop_button):
    output_delay = 0.75
    for i in range(p_arr_size*p_arr_size):
        if not p_stop_button.is_set():
            if (en := p_configuration[f"cell_{i}"]["state"]) != "0":
                print(f"actuated cell [{en}] {i}", end="")
                time.sleep(output_delay)

if __name__ == "__main__":

    ## Process JSON Input
    input_string = sys.argv[1]
    [timestamp, arr_size, bitness, configuration] = process_input_as_json(input_string)

    ## Print Input to STDOUT 
    print(f"Reading JSON from '{timestamp}'\n", 
        f"   Array Size:       {arr_size}x{arr_size}\n",
        f"   Bitness:          {bitness}\n",
        f"   Configuration:    {configuration}",
        )

    ## Init event to stop program
    stop_button = Event()

    ## Toggle signal using threaded function
    thread = Thread(target=actuate_cells, args=(arr_size, configuration,stop_button))
    thread.start()
    stop_request = input()
    if stop_request:
        stop_button.set()
    thread.join()
    
    print("Program Aborted!!", end="")
    exit()
