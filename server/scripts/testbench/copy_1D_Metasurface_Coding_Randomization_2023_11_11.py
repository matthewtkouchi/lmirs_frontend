# -*- coding: utf-8 -*-
"""
Created on Sat Jun  3 00:36:16 2023

@author: saige

for incident angle		negaitve goes left from normal

for reflected angle		negative goes right from normal

"""

import numpy as np
import matplotlib.pyplot as plt
from scipy import integrate
import random
import sys

def get_discrete_array(config, M, N):
    config_radians = np.array(config) * np.pi  # Convert discrete values to radians
    phase_shifts = np.zeros((M, N), dtype=float)
    for i in range(M):
        phase_shifts[i] = np.tile(config_radians, int(np.ceil(N / len(config_radians))))[:N]
    return phase_shifts

def generate_random_array(M, N):             # Produces random floats between [0, pi)
    random_phases = np.random.uniform(0, np.pi, size=(M, N)) 
    return random_phases

# Changes a 1-bit phase configuration to a multi-bit equivalent
def get_multibit_config(config):
    unique_phases, counts = np.unique(config, return_counts=True)
    #print(f"unique phases: {unique_phases}\tcount of unique phases: {counts}\tnum of unique phases: {n_phases}")
    result = np.empty((0, 0))
    for state, count in zip(unique_phases, counts):
        #print(f"Phase: {state}, Count: {count}")
        for i in range(count):
            #print(i, count);
            gradient = np.pi / count
            if state == 0:
                result = np.append(result, i*gradient)
            elif state == 1:
                result = np.append(result, i*gradient + np.pi)
            else:
                print("Error: Please provide a 1-bit config to get_multibit_config")
                sys.exit(1)
    result = radians_to_discrete(result)
    return result
            
def radians_to_discrete(radians_array):
    discrete_values = (radians_array % (2 * np.pi)) / np.pi
    return discrete_values
        
def discretize_radians(radians_array):
    return np.where((radians_array > -np.pi/2) & (radians_array < np.pi/2), 0, 180)


# Config Arrays
#config = [0, 0, 0, 0]
#config = [0, 1, 0, 1]
#config = [0, 1, 2, 3]
config = [0, 0, 1, 1]
#config = [0, 0, 0, 1, 1, 1]

#input param
wavelength = 0.010706 #meters 

period = 0.0045 #meters

#number of unit cells
M = 30
N = 30
num_points = 100

# Get 1-bit array phase matrix
phase_shifts = get_discrete_array(config, M, N)
onebit_arr = phase_shifts

# Convert 1-bit config into multi-bit equivalent
multibit_config = get_multibit_config(config)

# Get multibit array phase matrix
multibit_shifts = get_discrete_array(multibit_config, M, N)

# Get random phase array
rand_arr = generate_random_array(M, N)

# Multibit version of 1-bit array - random array in radians
multibit_rand = multibit_shifts - rand_arr

# Discretize back to 1-bit from multibit_rand
final_arr = discretize_radians(multibit_rand)

'''
print(f"1-bit array: \n{phase_shifts}")
print(f"Multibit array: \n{multibit_shifts}")
print(f"Rand array: \n{rand_arr}")
print(f"Multibit array - rand array: \n{multibit_rand}")
print(f"Final array (discretized back to 1-bit): \n{final_arr}")
'''

# Array to be plotted
phase_shifts = final_arr


#Pattern function
def pF(theta,phi): #pattern function f_e(theta,phi) is set to 1
    #initialize F to zero
    calF = 0
    #Calculate phase factor for each unit cell
    for i in range(M):
        for j in range(N):
            phase_factor = np.exp(-1j * (phase_shifts[i][j] + 2*np.pi/wavelength * period * 
                                          np.sin(theta) * ((i+1-1/2)*np.cos(phi) + (j+1-1/2)*np.sin(phi))))
            calF += phase_factor #add phase factor to F
    return calF


#Directivity function

def Dir(theta,phi):
    F = pF(theta,phi)
    
    #numerator
    num = 4*np.pi*abs(F)**2
    
    #arrays for evaluating integrals
    theta_array = np.linspace(0, np.pi/2, num_points)
    phi_array = np.linspace(0, 2*np.pi, num_points)
    pF_array = pF(theta_array[:,np.newaxis], phi_array[np.newaxis,:])
    
    
    #Evaluate integral
    integral = np.trapz(
        np.trapz(np.abs(pF_array)**2 * np.sin(theta_array[:,np.newaxis]), 
                  theta_array), phi_array)
    
    
    #Evaluate integral
    # result= integrate.dblquad(abs(F)**2 * np.sin(theta), 0, 2*np.pi, 0, np.pi/2)
    
    #Compute directivity
    Dir = num/integral
    
    return Dir



theta_x = np.arange(-90,91)
Dir_array = []
pF_array = []

for i in theta_x:
          Dir_array.append((Dir(np.radians(i), np.radians(-90))))


for i in theta_x:
          Re_pF = pF(np.radians(i), np.radians(-90)).real
          Im_pF = pF(np.radians(i), np.radians(-90)).imag
          mag_pF = 20*np.log10(np.sqrt(Re_pF**2 + Im_pF**2))
          if mag_pF < -30:
              mag_pF = -30
          pF_array.append(mag_pF)
          
# max_Dir = max(Dir_array)
# print('Max: ', max_Dir)

# min_Dir = min(Dir_array)
# print('Min: ', min_Dir)

# Create a list of your arrays
arrays = [onebit_arr, multibit_shifts, rand_arr, multibit_rand, final_arr]  # Replace array1, array2, array3 with your arrays

fig, axs = plt.subplots(1, len(arrays), figsize=(15, 5))  # Adjust figsize as needed
fig.suptitle('Multiple Color Maps')

for i, ax in enumerate(axs):
    ax.set_title(f'Array {i+1}')
    im = ax.imshow(arrays[i])
    ax.set_aspect('equal')

fig.colorbar(im, ax=axs, orientation='vertical')
plt.show()

max_pF = max(pF_array)
print('Max pF: ', max_pF)
print('Max Reflection at angle(deg): ',theta_x[pF_array.index(max(pF_array))])

min_pF = min(pF_array)
print('Min pF: ', min_pF)
#print('Min index: ', pF_array.index(min(pF_array)))
print('Lowest reflected signal at at angle(deg): ',theta_x[pF_array.index(min(pF_array))])


        
# for i in theta_x:
#     Dir_array[i] = Dir_array[i] - max_Dir
plt.figure()
plt.plot(theta_x, pF_array)
plt.show()
    


    


