"""
Title: actuation_v3.py
Originally By: Spring 2023 EE VIP Students 
Modified By: david947
Date Created: 2023-10-22
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
            int(data['frequency']),
            data['configuration'])


with nidaqmx.Task() as ac_task, nidaqmx.Task() as sel_task, nidaqmx.Task() as en_task:

    # def set_params(p_rate, p_samps_per_chan):
    def set_params(p_frequency, p_duration, p_samples):
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

        ## Define timing
        rate = p_frequency * p_samples
        samps_per_chan = p_duration * rate

        # ## Square wave parameter setting
        ac_task.timing.cfg_samp_clk_timing(rate=rate, samps_per_chan=samps_per_chan)

        ## Enable demux
        en_task.write(True)
        print("Demux enabled")


    def on(p_arr_size, p_samples, p_configuration, p_duration, p_stop_button):
        output_delay = 1
        # p_duration = 500

        ## Output signal continuously until told to turn off
        start_time = time.time()
        en_task.write(True)

        while (time.time() - start_time < p_duration):

            for num in range(p_arr_size*p_arr_size):
                en = p_configuration[f"cell_{num}"]
                if en["state"] != "0":
                    print(f'actuated cell [{en["state"]}] {num}', end="")

                    ## Get Signal Parameters for Cell "num"
                    neg_voltage = int(en["negVoltage"])
                    pos_voltage = int(en["posVoltage"])
                    # pos_voltage += 3
                    duty_cycle = int(en["dutyCycle"])
                    duty_cycle *= 100
                    # frequency = int(en["frequency"])
                    # print(f"{neg_voltage}:{pos_voltage} {duty_cycle} {frequency}")
                    # print(f"\n[{en["state"]}] {num} {neg_voltage} {pos_voltage}")

                    
                    ## Create and fill sample array
                    sample_array = np.arange(p_samples)
                    sample_array.fill(neg_voltage)
                    sample_array[0:duty_cycle] = pos_voltage
                    
                    ## Square wave parameter setting
                    # ac_task.timing.cfg_samp_clk_timing(rate=rate, samps_per_chan=samps_per_chan)

                    ## Actuate Signal
                    sel_task.write(2*num) # no need -1, should already be 0 to 15 
                    ac_task.write(data=sample_array, auto_start=True)
                    time.sleep(output_delay)

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
        input_string = sys.argv[1]
        [timestamp, arr_size, bitness, frequency, configuration] = process_input_as_json(input_string)
        
        ## Print Input to STDOUT 
        print(f"Reading JSON from '{timestamp}'\n", 
            f"   Array Size:       {arr_size}x{arr_size}\n",
            f"   Bitness:          {bitness}\n",
            f"   Frequency:          {frequency}\n",
            # f"   Configuration:    {configuration}",
            )

        ## Print Out of Bounds warning.
        if arr_size > 4:
            print("WARNING: array size exceeds 4x4. Cell selection may be out of bounds.")

        ## Set up settings
        duration = 500
        samples = 10000
        set_params(frequency, duration, samples)
        

        ## Init event to stop program
        stop_button = Event()

        ## Toggle signal using threaded function
        thread = Thread(target=on, args=(arr_size, samples, configuration, duration, stop_button))
        thread.start()
        stop_request = input()
        if stop_request:
            stop_button.set()
        thread.join()

        ## Exit
        off()


    user_interface()
    off()
