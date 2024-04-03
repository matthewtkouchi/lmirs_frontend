"""
Title: demux_redux.py
By: david
Date Created: 2023-11-02
Description:
    Modify '2023_05_01_User_Input_Toggle_Demux.py' to take input from JSON instead of keyboard. 
    Implement threading function to stop program. 
    Implement OOP conventions.

    "This is a program designed for use in the actuation control system of a 4x4 IRS
    design. The DAQ will be used for enabling the multiplexer, providing
    the output signal to the drain of the multiplexer, and for selecting which
    output the signal will be output to."
"""


import sys
import time
import numpy as np
import json
import nidaqmx
from nidaqmx.constants import LineGrouping
from threading import Thread, Event


class ControlSystem:
    def __init__(self, json_string_input: str) -> None:
        self.ac_task = nidaqmx.Task()
        self.sel_task = nidaqmx.Task()
        self.en_task = nidaqmx.Task()

        self.samples = 10000  # multipled to compensate for fast DAQ signal switching
        self.duration = 500  # default duration set for debugging purposes
        self.output_delay = 0 # delay between each cell actuation in seconds

        [self.timestamp,
         self.array_dimension,
         self.bitness,
         self.frequency,
         self.configuration] = self.process_input(json_string_input)

        self.set_rate_params()

    def process_input(self, _json_string):
        data = json.loads(_json_string)
        return (data['timestamp'],
                int(data['arrayDimension']),
                int(data['bitness']),
                int(data['frequency']),
                data['configuration'])

    def log_input_to_console(self):
        print(f"Reading JSON from '{self.timestamp}'\n",
              f"   Array Size:        {self.array_dimension}x{self.array_dimension}\n",
              f"   Bitness:           {self.bitness}\n",
              f"   Frequency:         {self.frequency}\n",
              f"   Output Delay (s):  {self.output_delay}\n",
              # f"   Configuration:    {configuration}",
              )

    def set_rate_params(self):
        """ Function for setting the timing and rate parameters of a signal.
            Channel Setup
            Check to see if channels have already been added to the task.
            If so, do not try to assign it again.
        """

        # Analog channel for actuation (pin ao0)
        if self.ac_task.channel_names == []:
            print("assign analog channel")
            ac_channel = self.ac_task.ao_channels.add_ao_voltage_chan("Dev1/ao0")

        # Digital channels for enable (pinp0.0)
        if self.en_task.channel_names == []:
            print("assign enable channel")
            en_channel = self.en_task.do_channels.add_do_chan(
                "Dev1/port0/line0",
                line_grouping=LineGrouping.CHAN_FOR_ALL_LINES)

        # Digital channel for a 1:16 demux select (pin p0.1:4)
        if self.sel_task.channel_names == []:
            print("assign selection channels")
            sel_channel = self.sel_task.do_channels.add_do_chan(
                "Dev1/port0/line1:4",
                line_grouping=LineGrouping.CHAN_FOR_ALL_LINES)

        # Define timing
        rate = self.frequency * self.samples
        samps_per_chan = self.duration * rate

        # Square wave parameter setting
        self.ac_task.timing.cfg_samp_clk_timing(
            rate=rate, samps_per_chan=samps_per_chan)

    def on(self, p_stop_button_event):
        """Output signal continuously until told to turn off"""

        # Enable demux
        start_time = time.time()
        self.en_task.write(True)
        print("Demux enabled")

        while (time.time() - start_time) < self.duration:
            # Iterate through each cell in the array
            for num in range(self.array_dimension * self.array_dimension):
                en = self.configuration[f"cell_{num}"] 
                if en["state"] != "0": # cell is switched on

                    # Get Signal Parameters for Cell "num"
                    neg_voltage = int(en["negVoltage"])
                    pos_voltage = int(en["posVoltage"])
                    duty_cycle = int(en["dutyCycle"]) * 100 # multipled to compensate for fast DAQ signal switching

                    # Create and fill sample array
                    sample_array = np.arange(self.samples)
                    sample_array.fill(neg_voltage)
                    sample_array[0:duty_cycle] = pos_voltage

                    # Actuate Signal
                    self.sel_task.write(2*num)  # write cells 0 to 15
                    self.ac_task.write(data=sample_array, auto_start=True)
                    time.sleep(self.output_delay)
                    
                    # trigger cellActuationEvent to highlight cells
                    print(f'actuated cell [{en["state"]}] {num}', end="")
                    
                # break
                # Check for stop button event
                if p_stop_button_event.is_set():
                    return

        print("THREAD STOPPING")
        self.off()

    def off(self):
        """Off function for the DAQ, resets everything to 0"""

        # Turn off square wave signal
        print("Resetting..")
        self.ac_task.stop()

        # Turn off select and enable inputs
        self.en_task.write(False)
        self.sel_task.write(0)
        print("Reset complete.")
        sys.exit()


if __name__ == "__main__":

    # Initialize Control System
    control_system = ControlSystem(sys.argv[1])

    # Print Input to STDOUT
    control_system.log_input_to_console()

    # Print Out of Bounds warning.
    if control_system.array_dimension > 4:
        print("WARNING: array size exceeds 4x4. Cell selection may be out of bounds.")

    # Init event to stop program
    stop_button_event = Event()

    # Use threaded function to listen for stop button input
    thread = Thread(target=control_system.on, args=(stop_button_event,))
    thread.start()
    stop_request = input()
    if stop_request:
        stop_button_event.set()
    thread.join()

    # Exit
    control_system.off()
