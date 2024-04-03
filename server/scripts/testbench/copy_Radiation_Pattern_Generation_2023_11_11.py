# -*- coding: utf-8 -*-
"""
Created on Sat Jun  3 00:36:16 2023

@author: saige

for incident angle		negaitve goes left from normal

for reflected angle		negative goes right from normal

Note for David: 
- i set the input params manually, idk if you need to have any of these in the config. im assuming not.
- also, i opened the json manually, you may have to change this path depending on how your json requests are implemented                 

"""

import numpy as np
import matplotlib.pyplot as plt
import json
import math

# Function: convert state array to radians array
def states_to_radians(array):
    unique_values = np.unique(array)
    num_unique = len(unique_values)
    phase_value = 2 * np.pi / num_unique
    radians_array = np.zeros_like(array, dtype=float)
    
    for i, value in enumerate(unique_values):
        radians_array[array == value] = i * phase_value
        
    return radians_array

# Convert a 1D array to a 2D array for the IRS matrix formatting
def array_to_matrix(array, M, N):
    if M * N != len(array):
        raise ValueError("Error: There is not enough rows/cols for the given array!")
        
    return array.reshape(M, N)

# Pattern function
def pF(theta,phi): # Pattern function f_e(theta,phi) is set to 1
    # Initialize F to zero
    calF = 0
    # Calculate phase factor for each unit cell
    for i in range(row):
        for j in range(col):
            phase_factor = np.exp(-1j * (phase_shifts[i][j] + 2*np.pi/wavelength * period * 
                                          np.sin(theta) * ((i+1-1/2)*np.cos(phi) + (j+1-1/2)*np.sin(phi))))
            calF += phase_factor #add phase factor to F
    return calF

# Directivity function
def Dir(theta,phi):
    F = pF(theta,phi)

    #numerator
    num = 4*np.pi*abs(F)**2
    
    # Arrays for evaluating integrals
    theta_array = np.linspace(0, np.pi/2, num_points)
    phi_array = np.linspace(0, 2*np.pi, num_points)
    pF_array = pF(theta_array[:,np.newaxis], phi_array[np.newaxis,:])
      
    # Evaluate integral
    integral = np.trapz(
        np.trapz(np.abs(pF_array)**2 * np.sin(theta_array[:,np.newaxis]), 
                  theta_array), phi_array)

    #Compute directivity
    Dir = num/integral
    return Dir
    
# Import json settings file
file = open('configuration_file.json')
json_data = json.load(file)

# Fetch configuration data from the json
config_data = json_data["configuration"]

# Get the state of each cell in the array
state_values = []
for _, cell_dict in config_data.items():
    state_values.append(int(cell_dict['state']))
    
# Input params
wavelength = 0.010706                       # Meters 
period = 0.0045                             # Unit cell period in meters
row = int(math.sqrt(len(state_values)))     # Rows             
col = row                                   # Cols
num_points = 100                            # Plot points
print(row, col)
# Convert state_values to a np array
config = np.array(state_values)

# Convert state array to radians config array
config = states_to_radians(config)

phase_shifts = array_to_matrix(config, row, col)
_
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
          
print(f"Rad pattern: {pF_array}")
print(f"Color Map: {phase_shifts}")

# Find max and min power factor
max_pF = max(pF_array)
print('Max Reflection at angle(deg): ',theta_x[pF_array.index(max(pF_array))])
min_pF = min(pF_array)
print('Lowest reflected signal at at angle(deg): ',theta_x[pF_array.index(min(pF_array))])

          
'''
FOR DAVID: 
    - The output radiation pattern array (y-axis values) is in pF_array
    - The output color map values is a 2D np array right now in phase_shifts
    - Everything below here is not needed for plotting in the IDE. 
    - You can ignore it if your going to plot using something else besides matplotlib
'''
         
fig = plt.figure(figsize=(6, 3.2))

ax = fig.add_subplot(111)
ax.set_title('colorMap')
plt.imshow(phase_shifts)
ax.set_aspect('equal')

cax = fig.add_axes([0.12, 0.1, 0.78, 0.8])
cax.get_xaxis().set_visible(False)
cax.get_yaxis().set_visible(False)
cax.patch.set_alpha(0)
cax.set_frame_on(False)
plt.colorbar(orientation='vertical', ax = ax)


# Plot radiation pattern
plt.figure()
plt.plot(theta_x, pF_array)
plt.show()
    


    


