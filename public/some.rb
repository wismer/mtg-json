@arr = (1..20).to_a.shuffle

require 'pry'
sample_array = [1, -10, 85, 22, 8, 3, -277, 400, 88, 9, 24, -3, 90, 4]
balanced = [1,2,3,4,5,4,3,2,1]

# brute force
def find_pivot(array, i = 1)

end

def find_pivot(array)
  array_sum = array.inject { |x, y| x + y }
  sum = 0
  i = array.length - 1
  until sum >= array_sum
    if (sum + array[i]) == array_sum
      return i
    end
    sum += array[i]
    array_sum -= array[i]
    i -= 1
  end

  return -1
end



binding.pry
