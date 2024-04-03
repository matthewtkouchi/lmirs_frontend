import sys
import json
import time
from threading import Thread, Event


def pretty_print_array(arr, dim):
    int_arr = arr[0:dim*dim]
    int_arr = [int(x) for x in int_arr]
    arr_string = [f"{en} " if ((i+1) % dim) else f"{en}\n\t\t      " for i, en in enumerate(int_arr)]
    return ''.join(arr_string)


def process_input_as_json(json_input):
    """this does that thing.

    Args:
        json_input (string): Stringified JSON from web app.

    Returns:
        timestamp: Time the command was called on the web interface Used as identifier.
        neg_voltage: Negative voltage (V). Between -10 and 10.
        pos_voltage: User-specified positive voltage (V). Between -10 and 10.
        frequency: Frequency (Hz)
        duty_cycle: Duty cycle (whole %). Between 0 and 100.
        dmux_output_num: Python dict to configure cells 0 to 15  

    """

    data = json.loads(json_input)

    return (data['timestamp'],
            float(data['negVoltage']),
            float(data['posVoltage']),
            int(data['frequency']),
            int(data['dutyCycle']),
            int(data['defaultDuration']),
            int(data['arrSize']),
            list(data['dmuxOutputNum']))


def actuate_cells(p_dmux_output_nums, p_stop_button):
    output_delay = 0.25
    for i, en in enumerate(p_dmux_output_nums):
        if not p_stop_button.is_set() and en != "0":
            print(f"actuated cell [{en}] {i}", end="")
            time.sleep(output_delay)


if __name__ == "__main__":

    # print(sys.argv[1])
    # test_string = '{"dmuxOutputNum":[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],"negVoltage":"-10","posVoltage":"10","frequency":"50","dutyCycle":"50","defaultDuration":"10","timestamp":"08/01/2023, 11:15:05 AM"}'

    # Process JSON Input
    # [timestamp, pos_voltage, neg_voltage, frequency,
    #  duty_cycle, default_duration, dmux_output_num] = process_input_as_json(test_string)

    ## Process JSON Input
    [timestamp, neg_voltage, pos_voltage, frequency,
     duty_cycle, default_duration, arr_size, dmux_output_num] = process_input_as_json(sys.argv[1])

    dmux_output_nums = []
    for i, num in enumerate(dmux_output_num):
        if isinstance(num, str):
            dmux_output_nums.append(num)
        elif isinstance(num, list):
            dmux_output_nums.append("".join(num))
        else:
            dmux_output_nums.append("")


    # Print Input to STDOUT
    print(f"Reading JSON from '{timestamp}'\n",
          f"   Negative Voltage: {neg_voltage} V\n",
          f"   Positive Voltage: {pos_voltage} V\n",
          f"   Frequency:        {frequency} Hz\n",
          f"   Duty Cycle:       {duty_cycle} %\n",
          f"   Default Duration: {default_duration} s\n",
          f"   Array Size:       {arr_size}x{arr_size}\n",
          f"   Configuration:    {dmux_output_nums}\n"
          f"\t\t      {pretty_print_array(dmux_output_nums, arr_size)}", end="")

    ## Init event to stop program
    stop_button = Event()

    ## Toggle signal using threaded function
    thread = Thread(target=actuate_cells, args=(dmux_output_nums,stop_button))
    thread.start()
    stop_request = input()
    if stop_request:
        stop_button.set()
    thread.join()
    
    print("Program Aborted!!", end="")
    exit()
