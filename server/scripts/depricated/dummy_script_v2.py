import sys
import json
import pprint as pp
import numpy

def pretty_print_array(arr, dim):
    int_arr = [1 if x else 0 for x in arr]
    print("intarr", int_arr)
    arr_string = ""
    for i, en in enumerate(int_arr):
        if (i+1)%dim:
            print(i+1, dim, (i+1)%dim)
            arr_string = arr_string+f"{en} "
        else:
            arr_string = arr_string+f"{en}\n "
    print("here", arr_string)
    return arr_string
    

def process_input_as_json(json_input):
    """_summary_

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

    return data['timestamp'], float(data['negVoltage']), float(data['posVoltage']), int(data['frequency']), int(data['dutyCycle']), int(data['defaultDuration']), list(data['dmuxOutputNum'])


if __name__ == "__main__":
    
    shit = '{"dmuxOutputNum":[true,true,false,false,true,false,true,false,true,false,false,false,false,true,true,false],"negVoltage":"-10","posVoltage":"10","frequency":"50","dutyCycle":"50","defaultDuration":"50","timestamp":"07/12/2023, 05:12:47 AM"}'
    
    [timestamp, neg_voltage, pos_voltage, frequency, 
     duty_cycle, default_duration, dmux_output_num] = process_input_as_json(shit)

    print(f"Reading JSON from '{timestamp}'")
    print(f"   Negative Voltage: {neg_voltage} V")
    print(f"   Positive Voltage: {pos_voltage} V")
    print(f"   Frequency:        {frequency} Hz")
    print(f"   Duty Cycle:       {duty_cycle} %")
    print(f"   Default Duration: {default_duration} s")
    print(f"   Configuration:    {pretty_print_array(dmux_output_num,4)}")
    
    while (1):
        a = input("Waiting for SIGINT: ")
        if a == 'q':
            print("Program Aborted!!")
            exit()
