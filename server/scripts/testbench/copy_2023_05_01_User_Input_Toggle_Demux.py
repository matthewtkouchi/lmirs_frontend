#This is a program designed for use in the actuation control system of a 4x4 IRS
#design. The DAQ will be used for enabling the multiplexer, providing
#the output signal to the drain of the multiplexer, and for selecting which
#output the signal will be output to. 

import time as t
import numpy as np
import keyboard as kb
import nidaqmx
from nidaqmx.constants import (
    LineGrouping)
with nidaqmx.Task() as ac_task, nidaqmx.Task() as sel_task, nidaqmx.Task() as en_task:

    #function for setting the parameters of the signal
    def setParams(rte, spc, i):
        #channel setup
        #analog channel for actuation (pin ao0)
        #Check to see if the channels have already been added to the task. If they
        #have, do not try to assign it again
        if(ac_task.channel_names == []): 
            print("assign analog channel")
            ac_channel = ac_task.ao_channels.add_ao_voltage_chan("Dev1/ao0")
        #digital channel for enable (pin p0.0)
        if(en_task.channel_names == []):
            print("assign enable channel")
            en_channel = en_task.do_channels.add_do_chan(
                'Dev1/port0/line0',
                line_grouping=LineGrouping.CHAN_FOR_ALL_LINES)
        #digital channel for a 1:16 demux select (pin p0.1:4)
        #p0.1 wired to A0 of demux, p0.2 wired to A1 of demux, etc.
        if(sel_task.channel_names == []):
            print("assign selection channels")
            sel_channel = sel_task.do_channels.add_do_chan(
                'Dev1/port0/line1:4',
                line_grouping=LineGrouping.CHAN_FOR_ALL_LINES)
        #square wave parameter setting
        #frequency = rate/samples, duration = samps_per_chan/rate
        ac_task.timing.cfg_samp_clk_timing(rate = rte, samps_per_chan = spc)
        #enable the demux
        en_task.write(True)
        print("demux enabled")
        #adjust demux select input
        #need to subtract 1 from i because the demux selection goes from 0-15
        #instead of 1-16
        #need to multiply by 2 because the selection pins start with p0.1 and
        #not p0.0
        sel_task.write(2*(i-1))
        print("selecting output S",i)
        
    #starts signal geneteration for DAQ 
    def on(s1, rte, spc):
        #print the default duration
        maxDuration = spc/rte
        print("default duration (s):",maxDuration)
        turnOff = False;
        t.sleep(1)
        print("signal generation start, press t to disable the demux")
        #output the signal continuously until told to turn off
        while(turnOff == False):
            ac_task.write(s1, auto_start=True)
            #disable demux if user presses t
            #check to see if t is pressed until signal generation is done
            startTime = t.time()
            while (t.time() - startTime < maxDuration):
                #disable demux if user presses t
                if(kb.is_pressed("t") and turnOff == False):
                    en_task.write(False)
                    turnOff = True;
                    print("Demux disabled, press t to re-enable the demux or wait until signal generation is done to quit/change the signal")
                    #short delay needed to avoid constant switching
                    t.sleep(1)
                #re-enable to demux if user presses t again
                elif (kb.is_pressed("t") and turnOff == True):
                    en_task.write(True)
                    turnOff = False;
                    print("Demux enabled, press t again to disable the demux")
                    #short delay needed to avoid constant switching
                    t.sleep(1)
            ac_task.wait_until_done(100)
            ac_task.stop()
        #reset output voltage to 0 V
        ac_task.timing.cfg_samp_clk_timing(rate = 2, samps_per_chan = 2)
        ac_task.write([0, 0], auto_start=True)
        ac_task.wait_until_done(100)
        ac_task.stop()
        ac_task.timing.cfg_samp_clk_timing(rate = rte, samps_per_chan = spc)
        #enable demux
        en_task.write(True)
        print("signal generation done")
        
    #off function for DAQ, resets everything to 0
    def off():
        #turn off square wave signal
        print("reset start")
        ac_task.timing.cfg_samp_clk_timing(rate = 2, samps_per_chan = 2)
        ac_task.write([0, 0], auto_start=True)
        ac_task.wait_until_done(100)
        ac_task.stop()
        #turn off select and enable inputs
        en_task.write(False)
        sel_task.write(0)
        print("reset done")

    #Basic user prompt    
    def UI():
        exit = 0
        while(exit != 1):
            #Input Statement 
            PV, NV, = [float(i) for i in input("Please input a Positive Voltage (V) and a Negative Voltage (V). Inputs must be between -10 and 10. Put a space between each value and press enter to submit.  : ").split()]
            Hz, Duty, DemuxOutNum = [int(j) for j in input("Please input a Frequency (Hz), Duty Cycle (whole %), and Demux output #(1-16). Put a space between each value and press enter to submit.  : ").split()]
            DefaultDuration = int(input("Please input a default duration (s) for the signal. Note that you can stop the output of the signal before this duration has elapsed. Press enter to submit.  : "))
            
            #Defining Variables
            samples = 100
            rate = (Hz*samples)
            samps_per_chan = (DefaultDuration*rate)
            
            #create and fill sample array
            sArray = np.arange(100)
            sArray.fill(NV)
            sArray[0:Duty] = PV
            
            #set up settings 
            setParams(rate, samps_per_chan, DemuxOutNum)
            
            #loop for running signal
            print("press t to turn on the signal (off by default), press q to quit or change signal parameters")
            while True:
                #press q to quit 
                if kb.read_key() == "q":
                    off()
                    break
                #press t to toggle signal
                elif kb.read_key() == "t":
                    on(sArray, rate, samps_per_chan)
                #else:
                    #off()
            
            #Option to continue or quit entirely
            option = input("Enter q to quit, c to continue with different signal parameters: ")
            
            while(exit != 1):
                if(option == "q"):
                    exit = 1
                elif(option == "c"):
                    break
                else:
                    print("Inavlid Input, Try Again")
                    option = input("Enter q to quit, c to continue with different signal parameters: ")
                
    #main    
    UI()


    
    
