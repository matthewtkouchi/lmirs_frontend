"""
Title: multi_cell.py
Originally By: Spring 2023 EE VIP Students 
Modified By: david947
Date Created: 2023-07-30
Description:
    Modify '2023_05_01_User_Input_Toggle_Demux.py' to take input from JSON instead of keyboard. 
    Implement signal_handler() function to stop program

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


def pretty_print_array(arr, dim):
    int_arr = [1 if x else 0 for x in arr]
    arr_string = [f"{en} " if ((i+1)%dim) else f"{en}\n\t\t      " for i, en in enumerate(int_arr)]
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
            list(data['dmuxOutputNum']))

def actuate_cells(dmux_output_num, output_delay):
    for i,en in enumerate(dmux_output_num):
        if en:
            time.sleep(output_delay)
            print(f"actuated cell {i}",end="")
    time.sleep(output_delay)


with nidaqmx.Task() as ac_task, nidaqmx.Task() as sel_task, nidaqmx.Task() as en_task:

    def set_params(p_rate, p_samps_per_chan, p_dmux_output_num):
        """ Channel Setup
            Check to see if channels have already been added to the task.
            If so, do not try to assign it again
        """

        ## Analog channel for actuation (pin ao0)
        if ac_task.channel_names == []:
            print("assign analog channel")
            ac_channel = ac_task.ao_channels.add_ao_voltage_chan("Dev1,ao0")

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

        ## Adjust demux select input
        sel_task.write(2*(p_dmux_output_num-1)) 
        print(f"Selecting Output S: {p_dmux_output_num}")



    def on(p_sample_array, p_rate, p_samps_per_chan):
        """Starts signal generation for the DAQ"""

        ## Print default duration
        max_duration = p_samps_per_chan / p_rate
        print(f"Default duration (s): {max_duration}")

        ## 
        turn_off = False
        time.sleep(1)

        while (not turn_off):
            ac_task.write(data=p_sample_array, auto_start=True)
            start_time = time.time()

            while (time.time() - start_time < max_duration):
                en_task.write(True)
                turn_off = False
                time.sleep(1)
            
            ac_task.wait_until_done(100)
            ac_task.stop()

        ## Reset output voltage to 0V
        ac_task.timing.cfg_samp_clk_timing(rate=2, samps_per_chan=2)
        ac_task.write(data=[0,0],auto_start=True)
        ac_task.wait_until_done(100)
        ac_task.stop()
        ac_task.timing.cfg_samp_clk_timing(rate=2, samps_per_chan=2)

        ## Enable demux
        en_task.write(True)
        print("Signal generation complete.")



    def off():
        """Off function for the DAQ, resets everything to 0"""
        print("Resetting..")

        ## Turn off square wave signal
        ac_task.timing.cfg_samp_clk_timing(rate=2, samps_per_chan=2)
        ac_task.write(data=[0,0],auto_start=True)
        ac_task.wait_until_done(100)
        ac_task.stop()

        ## Turn off select and enable inputs
        en_task.write(False)
        sel_task.write(0)
        print("Reset complete.")


    def user_interface():

        ## Process JSON Input
        [timestamp, pos_voltage, neg_voltage, frequency, 
        duty_cycle, default_duration, dmux_output_num] = process_input_as_json(sys.argv[1])

        ## Print Input to STDOUT 
        print(f"Reading JSON from '{timestamp}'\n", 
            f"   Negative Voltage: {neg_voltage} V\n",
            f"   Positive Voltage: {pos_voltage} V\n",
            f"   Frequency:        {frequency} Hz\n",
            f"   Duty Cycle:       {duty_cycle} %\n",
            f"   Default Duration: {default_duration} s\n",
            f"   Configuration:    {pretty_print_array(dmux_output_num,4)}", end="")
        

        ## Define variables
        samples = 100
        rate = frequency * samples
        samps_per_chan = default_duration * rate

        ## Create and fill sample array
        sample_array = np.arange(100)
        sample_array.fill(neg_voltage)
        sample_array[0:duty_cycle] = pos_voltage

        ## Set up settings
        set_params(rate, samps_per_chan, dmux_output_num)

        ## Toggle signal
        on(sample_array, rate, samps_per_chan)

        ## Exit
        off()


    user_interface()
