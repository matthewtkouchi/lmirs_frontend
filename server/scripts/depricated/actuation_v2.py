"""
Title: actuation_v2.py
Originally By: Spring 2023 EE VIP Students 
Modified By: david947
Date Created: 2023-09-01
Description:
    Modify '2023_05_01_User_Input_Toggle_Demux.py' to take input from JSON instead of keyboard. 
    Intentionally did not perform major refactor of original script.
    Implement 'on()' in thread function. Trigger 'stop_button' event to stop program. 
    Compatible with any array dimension.

    "This is a program designed for use in the actuation control system of a 4x4 IRS
    design. The DAQ will be used for enabling the multiplexer, providing
    the output signal to the drain of the multiplexer, and for selecting which
    output the signal will be output to."
"""


import sys
import time
import numpy as np
import json
import time 
import nidaqmx
from nidaqmx.constants import LineGrouping
from threading import Thread, Event


def pretty_print_array(arr, dim):
    int_arr = arr[0:dim*dim]
    int_arr = [1 if x else 0 for x in int_arr]
    arr_string = [f"{en} " if ((i+1) % dim) else f"{en}\n\t\t      " for i, en in enumerate(int_arr)]
    return ''.join(arr_string)


def process_input_as_json(json_input):
    """parses input string as JSON. Returns as list.

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

def actuate_cells(dmux_output_num, output_delay):
    for i,en in enumerate(dmux_output_num):
        if en:
            time.sleep(output_delay)
            print(f"actuated cell {i}",end="")
    time.sleep(output_delay)


with nidaqmx.Task() as ac_task, nidaqmx.Task() as sel_task, nidaqmx.Task() as en_task:

    def set_params(p_rate, p_samps_per_chan):
        """ Function for setting the parameters of a signal.
            Channel Setup
            Check to see if channels have already been added to the task.
            If so, do not try to assign it again.
        """

        ## Analog channel for actuation (pin ao0)
        if ac_task.channel_names == []:
            print("assign analog channel")
            ac_channel = ac_task.ao_channels.add_ao_voltage_chan("Dev1/ao0")

        ## Digital channels for enable (pinp0.0)
        if en_task.channel_names == []:
            print("assign enable channel")
            en_channel = en_task.do_channels.add_do_chan(
                "Dev1/port0/line0", 
                line_grouping=LineGrouping.CHAN_FOR_ALL_LINES)
            
        ## Digital channel for a 1:16 demux select (pin p0.1:4)
        if sel_task.channel_names == []:
            print("assign selection channels")
            sel_channel = sel_task.do_channels.add_do_chan(
                "Dev1/port0/line1:4",
                line_grouping=LineGrouping.CHAN_FOR_ALL_LINES)

        ## Square wave parameter setting
        ac_task.timing.cfg_samp_clk_timing(rate=p_rate, samps_per_chan=p_samps_per_chan)

        ## Enable demux
        en_task.write(True)
        print("Demux enabled")



    def on(p_sample_array, p_rate, p_samps_per_chan, p_dmux_output_nums, p_stop_button):
        """Starts signal generation for the DAQ"""

        ## Print default duration
        max_duration = p_samps_per_chan / p_rate
        print(f"Default duration (s): {max_duration}")

        ## Output signal continuously until told to turn off
        start_time = time.time()
        ac_task.write(data=p_sample_array, auto_start=True)
        en_task.write(True)

        print(f"Selecting Output S: {p_dmux_output_nums}")
        while (time.time() - start_time < max_duration):
            for num in p_dmux_output_nums:
                ## Adjust demux select input
                sel_task.write(2*num) # no need -1, should already be 0 to 15 
            if p_stop_button.is_set():
                print("THREAD STOPPING")
                off()

    def off():
        """Off function for the DAQ, resets everything to 0"""

        ## Turn off square wave signal
        print("Resetting..")
        ac_task.stop()

        ## Turn off select and enable inputs
        en_task.write(False)
        sel_task.write(0)
        print("Reset complete.")
        sys.exit()


    def user_interface():
        """Basic User Prompt"""

        ## Process JSON Input
        # input_string = '{"dmuxOutputNum":[false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true],"negVoltage":"-10","posVoltage":"10","frequency":"50","dutyCycle":"50","defaultDuration":"10","timestamp":"08/01/2023, 11:15:05 AM"}'
        input_string = sys.argv[1]
        
        [timestamp, neg_voltage, pos_voltage, frequency, 
        duty_cycle, default_duration, arr_size, dmux_output_array] = process_input_as_json(input_string)

        ## Print Input to STDOUT 
        print(f"Reading JSON from '{timestamp}'\n", 
            f"   Negative Voltage: {neg_voltage} V\n",
            f"   Positive Voltage: {pos_voltage} V\n",
            f"   Frequency:        {frequency} Hz\n",
            f"   Duty Cycle:       {duty_cycle} %\n",
            f"   Default Duration: {default_duration} s\n",
            f"   Array Size:       {arr_size}x{arr_size}\n",
            f"   Configuration:    {pretty_print_array(dmux_output_array, arr_size)}", end="")

        ## Print Out of bounds warning.
        if arr_size > 4:
            print("WARNING: array size exceeds 4x4. Cell selection may be out of bounds.")

        ## Define timing
        samples = 100 # so in terms of percentages
        rate = frequency * samples
        samps_per_chan = default_duration * rate

        ## Create and fill sample array
        sample_array = np.arange(samples)
        sample_array.fill(neg_voltage)
        sample_array[0:duty_cycle] = pos_voltage

        ## Prepare Demux Output
        dmux_output_nums = [i for i,num in enumerate(dmux_output_array) if num == True]

        ## Set up settings
        set_params(rate, samps_per_chan)

        ## Init event to stop program
        stop_button = Event()

        ## Toggle signal using threaded function
        thread = Thread(target=on, args=(sample_array, rate, samps_per_chan, dmux_output_nums, stop_button))
        thread.start()
        stop_request = input()
        if stop_request:
            stop_button.set()
        thread.join()

        ## Exit
        off()


    user_interface()
    off()
